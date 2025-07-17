import { parentPort, workerData, threadId } from 'worker_threads';
import * as sharp from 'sharp';
import { join, basename } from 'path';
import { mkdir } from 'fs/promises';

const { imagePath, outputDir, sharedBuffer } = workerData;

let sharedArray: Int32Array | null = null;
if (sharedBuffer) {
  sharedArray = new Int32Array(sharedBuffer);
}

mkdir(outputDir, { recursive: true })
  .then(() => {
    const outputPath = join(outputDir, basename(imagePath));
    return sharp(imagePath).resize(150).toFile(outputPath);
  })
  .then(() => {
    if (sharedArray) {
      Atomics.add(sharedArray, 0, 1);
    }
    parentPort?.postMessage({ status: 'processed' });
  })
  .catch(() => {
    if (sharedArray) {
      Atomics.add(sharedArray, 1, 1);
    }
    parentPort?.postMessage({ status: 'skipped' });
  });
