import { Injectable } from '@angular/core';
import { CellData, Tile } from './worldGeneration/world-map.service';

interface CompressedCellData {
  e: number; // elevation
  m: number; // moisture
  t: number; // temperature
  b: string; // biome code
}

@Injectable({ providedIn: 'root' })
export class FileSystemService {
  private directoryHandle: FileSystemDirectoryHandle | null = null;
  private readonly chunkSize = 512;

  constructor() {}

  async requestDirectoryAccess(): Promise<void> {
    //@ts-expect-error
    this.directoryHandle = await window.showDirectoryPicker();
  }

  hasDirectory(): boolean {
    return !!this.directoryHandle;
  }
  private biomeNameToCode(name: string): number {
    const map: Record<string, number> = {
      beach: 1, desert: 2, woodland: 3, taiga: 4, tundra: 5,
      rainforest: 6, grassland: 7, forest: 8, mountain: 9,
      rock: 10, alpine: 11, 'alpine grassland': 12, ocean: 13, water: 14
    };
    return map[name] ?? 0;
  }
  
  private codeToBiomeName(code: number): string {
    const map: Record<number, string> = {
      1: 'beach', 2: 'desert', 3: 'woodland', 4: 'taiga', 5: 'tundra',
      6: 'rainforest', 7: 'grassland', 8: 'forest', 9: 'mountain',
      10: 'rock', 11: 'alpine', 12: 'alpine grassland', 13: 'ocean', 14: 'water'
    };
    return map[code] ?? 'unknown';
  }
  
  private biomeCodeMap: Record<string, string> = {
    b: 'beach', d: 'desert', w: 'woodland', t: 'taiga', u: 'tundra',
    r: 'rainforest', g: 'grassland', f: 'forest', m: 'mountain',
    k: 'rock', a: 'alpine', l: 'alpine grassland', o: 'ocean', v: 'water'
  };
  
  private nameToLetterCode(name: string): string {
    const map: Record<string, string> = {
      beach: 'b', desert: 'd', woodland: 'w', taiga: 't', tundra: 'u',
      rainforest: 'r', grassland: 'g', forest: 'f', mountain: 'm',
      rock: 'k', alpine: 'a', 'alpine grassland': 'l', ocean: 'o', water: 'v'
    };
    return map[name] ?? '?';
  }
  
  
  private compressChunk(chunk: CellData[][]): CompressedCellData[][] {
    return chunk.map(row =>
      row.map(cell => ({
        e: Number(cell.elevation.toFixed(3)),
        m: Number(cell.moisture.toFixed(3)),
        t: Number(cell.temperature.toFixed(3)),
        b: this.nameToLetterCode(cell.biome), 
      }))
    );
  }
  
  private decompressChunk(compressed: CompressedCellData[][]): CellData[][] {
    return compressed.map(row =>
      row.map(c => ({
        elevation: c.e,
        moisture: c.m,
        temperature: c.t,
        biome: this.biomeCodeMap[c.b] ?? 'unknown',
      }))
    );
  }
  
  // 🏗️ BINARY ENCODE (no changes needed)
  private encodeChunkBinary(chunk: CellData[][]): ArrayBuffer {
    const width = chunk[0]?.length ?? this.chunkSize;
    const height = chunk.length ?? this.chunkSize;
    const bytesPerCell = 2 + 2 + 2 + 1;
    const buffer = new ArrayBuffer(width * height * bytesPerCell);
    const view = new DataView(buffer);
    let i = 0;
  
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = chunk[y][x];
        view.setUint16(i, Math.round(cell.elevation * 1000)); i += 2;
        view.setUint16(i, Math.round(cell.moisture * 1000)); i += 2;
        view.setUint16(i, Math.round(cell.temperature * 1000)); i += 2;
        view.setUint8(i, this.biomeNameToCode(cell.biome)); i += 1;
  
      
      }
    }
    return buffer;
  }
  
  // 🏗️ BINARY DECODE (no changes needed)
  private decodeChunkBinary(buffer: ArrayBuffer): CellData[][] {
    const view = new DataView(buffer);
    const width = this.chunkSize;
    const height = this.chunkSize;
    const chunk: CellData[][] = [];
    let i = 0;
  
    for (let y = 0; y < height; y++) {
      const row: CellData[] = [];
      for (let x = 0; x < width; x++) {
        const elevation = view.getUint16(i) / 1000; i += 2;
        const moisture = view.getUint16(i) / 1000; i += 2;
        const temperature = view.getUint16(i) / 1000; i += 2;
        const biome = this.codeToBiomeName(view.getUint8(i)); i += 1;  
        row.push({ elevation, moisture, temperature, biome });
      }
      chunk.push(row);
    }
    return chunk;
  }
  
  async saveChunkAsJSON(chunk: CellData[][], x: number, y: number): Promise<void> {
    const json = JSON.stringify(this.compressChunk(chunk));
    const fileHandle = await this.getFileHandle(`chunk_${x}_${y}.json`, 'maps');
    const writable = await fileHandle.createWritable();
    await writable.write(json);
    await writable.close();
  }

  async loadOrSaveChunkJSON(gen: () => CellData[][], x: number, y: number): Promise<CellData[][]> {
    try {
      const fileHandle = await this.getFileHandle(`chunk_${x}_${y}.json`, 'maps');
      const file = await fileHandle.getFile();
      const text = await file.text();
      const compressed = JSON.parse(text) as CompressedCellData[][];
      return this.decompressChunk(compressed);
    } catch {
      const chunk = gen();
      await this.saveChunkAsJSON(chunk, x, y);
      return chunk;
    }
  }

  async saveChunkAsBinary(chunk: CellData[][], x: number, y: number): Promise<void> {
    const buffer = this.encodeChunkBinary(chunk);
    const fileHandle = await this.getFileHandle(`chunk_${x}_${y}.bin`, 'maps');
    const writable = await fileHandle.createWritable();
    await writable.write(buffer);
    await writable.close();
  }

  async loadOrSaveChunkBinary(gen: () => CellData[][], x: number, y: number): Promise<CellData[][]> {
    try {
      const fileHandle = await this.getFileHandle(`chunk_${x}_${y}.bin`, 'maps');
      const file = await fileHandle.getFile();
      const buffer = await file.arrayBuffer();
      return this.decodeChunkBinary(buffer);
    } catch {
      const chunk = gen();
      await this.saveChunkAsBinary(chunk, x, y);
      return chunk;
    }
  }
  private async getFileHandle(name: string, folder: string): Promise<FileSystemFileHandle> {
    if (!this.directoryHandle) throw new Error('No directory selected');
    const dir = await this.directoryHandle.getDirectoryHandle(folder, { create: true });
    return await dir.getFileHandle(name, { create: true });
  }
}
