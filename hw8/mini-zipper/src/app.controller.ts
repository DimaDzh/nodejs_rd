import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { AppService } from './app.service';
import { ProcessZipResultDto } from './dto/zip.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('zip')
  @UseInterceptors(FileInterceptor('file'))
  async handleUpload(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ProcessZipResultDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.originalname.endsWith('.zip')) {
      throw new BadRequestException('Only .zip files are allowed!');
    }

    const result = await this.appService.processZip(file.path);
    console.log(result);
    return result;
  }
}
