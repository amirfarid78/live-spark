import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

export enum StorageDriver {
  LOCAL = 'local',
  S3 = 's3',
}

@Injectable()
export class StorageService {
  private driver: StorageDriver;
  private localPath: string;
  private baseUrl: string;

  constructor(private config: ConfigService) {
    this.driver = (config.get('STORAGE_DRIVER') || 'local') as StorageDriver;
    this.localPath = config.get('UPLOAD_PATH') || './uploads';
    this.baseUrl = config.get('BACKEND_URL') || 'http://localhost:3000';

    // Ensure upload directories exist
    const dirs = ['avatars', 'videos', 'thumbnails', 'gifts', 'products', 'misc'];
    for (const dir of dirs) {
      const fullPath = path.join(this.localPath, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
    allowedMimes?: string[],
    maxSizeMb?: number,
  ): Promise<{ url: string; key: string; size: number; mime: string }> {
    if (!file) throw new BadRequestException('No file provided');

    if (allowedMimes && !allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} not allowed. Allowed: ${allowedMimes.join(', ')}`);
    }

    const maxBytes = (maxSizeMb || 50) * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new BadRequestException(`File too large. Max: ${maxSizeMb || 50}MB`);
    }

    if (this.driver === StorageDriver.S3) {
      return this.uploadToS3(file, folder);
    }

    return this.uploadLocal(file, folder);
  }

  private async uploadLocal(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; key: string; size: number; mime: string }> {
    const ext = path.extname(file.originalname) || this.getExtFromMime(file.mimetype);
    const key = `${folder}/${uuid()}${ext}`;
    const destPath = path.join(this.localPath, key);

    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // If file is already saved by multer diskStorage
    if (file.path) {
      fs.copyFileSync(file.path, destPath);
    } else {
      fs.writeFileSync(destPath, file.buffer);
    }

    const url = `${this.baseUrl}/uploads/${key}`;
    return { url, key, size: file.size, mime: file.mimetype };
  }

  private async uploadToS3(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; key: string; size: number; mime: string }> {
    // S3 / Supabase Storage implementation
    // Using fetch to Supabase Storage REST API
    const supabaseUrl = this.config.get('SUPABASE_URL');
    const supabaseKey = this.config.get('SUPABASE_SERVICE_ROLE_KEY');
    const bucket = this.config.get('STORAGE_BUCKET') || 'uploads';

    const ext = path.extname(file.originalname) || this.getExtFromMime(file.mimetype);
    const key = `${folder}/${uuid()}${ext}`;

    const buffer = file.path ? fs.readFileSync(file.path) : file.buffer;

    const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${key}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': file.mimetype,
        'x-upsert': 'true',
      },
      body: new Uint8Array(buffer),
    });

    if (!response.ok) {
      throw new BadRequestException(`Storage upload failed: ${response.statusText}`);
    }

    const url = `${supabaseUrl}/storage/v1/object/public/${bucket}/${key}`;
    return { url, key, size: file.size, mime: file.mimetype };
  }

  async deleteFile(key: string): Promise<void> {
    if (this.driver === StorageDriver.S3) {
      return this.deleteFromS3(key);
    }
    return this.deleteLocal(key);
  }

  private async deleteLocal(key: string): Promise<void> {
    const filePath = path.join(this.localPath, key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  private async deleteFromS3(key: string): Promise<void> {
    const supabaseUrl = this.config.get('SUPABASE_URL');
    const supabaseKey = this.config.get('SUPABASE_SERVICE_ROLE_KEY');
    const bucket = this.config.get('STORAGE_BUCKET') || 'uploads';

    await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${key}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${supabaseKey}` },
    });
  }

  getPublicUrl(key: string): string {
    if (this.driver === StorageDriver.S3) {
      const supabaseUrl = this.config.get('SUPABASE_URL');
      const bucket = this.config.get('STORAGE_BUCKET') || 'uploads';
      return `${supabaseUrl}/storage/v1/object/public/${bucket}/${key}`;
    }
    return `${this.baseUrl}/uploads/${key}`;
  }

  private getExtFromMime(mime: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'video/mp4': '.mp4',
      'video/webm': '.webm',
      'audio/mpeg': '.mp3',
      'audio/wav': '.wav',
    };
    return map[mime] || '';
  }
}
