import { Injectable } from '@angular/core';
import { FileSystemService } from './chunk-filesystem.service'; // reuse directory handle
import { GameStateData } from './world-data.service';

@Injectable({ providedIn: 'root' })
export class GameStateFileSystemService {
  private directoryHandle: FileSystemDirectoryHandle | null = null;

  constructor(private fileSystemService: FileSystemService) {}

  async initializeDirectory(): Promise<void> {
    this.directoryHandle = this.fileSystemService['directoryHandle'];
  }

  private async ensureStateFolder(): Promise<FileSystemDirectoryHandle> {
    this.directoryHandle = this.directoryHandle || this.fileSystemService['directoryHandle'];
    if (!this.directoryHandle) this.fileSystemService.requestDirectoryAccess();
    return await this.directoryHandle!.getDirectoryHandle('state', { create: true });
  }

  private getStateFilename(chunkId: string): string {
    return `state_${chunkId}.json`;
  }

  async saveGameState(chunkId: string, state: GameStateData): Promise<void> {
    const folder = await this.ensureStateFolder();
    const filename = this.getStateFilename(chunkId);
    const fileHandle = await folder.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(state));
    await writable.close();
  }

  async loadGameState(chunkId: string): Promise<GameStateData | undefined> {
    const folder = await this.ensureStateFolder();
    const filename = this.getStateFilename(chunkId);
    try {
      const fileHandle = await folder.getFileHandle(filename);
      const file = await fileHandle.getFile();
      const text = await file.text();
      return JSON.parse(text) as GameStateData;
    } catch (err) {
      console.warn(`No game state found for chunk ${chunkId}`);
      return undefined;
    }
  }

  async hasGameState(chunkId: string): Promise<boolean> {
    const folder = await this.ensureStateFolder();
    const filename = this.getStateFilename(chunkId);
    try {
      await folder.getFileHandle(filename);
      return true;
    } catch {
      return false;
    }
  }
}
