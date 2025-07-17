import { Injectable } from '@nestjs/common';
import * as AdmZip from 'adm-zip';
import { mkdir, writeFile, rm, access, unlink } from 'fs/promises';
import { join, extname, basename } from 'path';
import { randomUUID } from 'crypto';
import { Worker } from 'worker_threads';
import { Mutex } from 'async-mutex';

@Injectable()
export class AppService {
  async processZip(filePath: string) {
    const t0 = performance.now();
    const requestId = randomUUID();
    const targetDir = join('./tmp', requestId);

    const zip = new AdmZip(filePath);
    const zipEntries = zip.getEntries().filter((e) => !e.isDirectory);

    await unlink(filePath);

    const outputDir = join('./tmp', requestId, 'thumbnails');
    await mkdir(outputDir, { recursive: true });

    const sharedBuffer = new SharedArrayBuffer(8);
    const sharedArray = new Int32Array(sharedBuffer);
    sharedArray[0] = 0;
    sharedArray[1] = 0;

    const mutex = new Mutex();

    const imagePaths: string[] = [];

    for (const entry of zipEntries) {
      const ext = extname(entry.entryName).toLowerCase();
      const allowed = ['.jpg', '.jpeg', '.png'];
      if (!allowed.includes(ext)) {
        const release = await mutex.acquire();
        try {
          Atomics.add(sharedArray, 1, 1);
        } finally {
          release();
        }
        continue;
      }

      const filename = basename(entry.entryName);
      const outputPath = join(targetDir, filename);

      await writeFile(outputPath, entry.getData());
      imagePaths.push(outputPath);
    }

    const workers = imagePaths.map((path) => {
      return new Promise<void>((resolve) => {
        const worker = new Worker(join(__dirname, 'workers', 'thumbnail.js'), {
          workerData: { imagePath: path, outputDir, sharedBuffer },
        });

        worker.on('message', (msg) => {
          resolve();
        });

        worker.on('error', () => {
          resolve();
        });
      });
    });

    await Promise.allSettled(workers);
    const durationMs = Math.round(performance.now() - t0);

    for (const imagePath of imagePaths) {
      try {
        await rm(imagePath, { force: true });
      } catch (error) {}
    }

    const release = await mutex.acquire();
    let processed: number, skipped: number;
    try {
      processed = Atomics.load(sharedArray, 0);
      skipped = Atomics.load(sharedArray, 1);
    } finally {
      release();
    }

    return {
      processed,
      skipped,
      durationMs,
      requestId,
    };
  }
}
