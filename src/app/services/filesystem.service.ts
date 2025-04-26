import { Injectable } from '@angular/core';
import { TileData } from './worldGeneration/world-map.service'; // Adjust path

interface CompressedTile {
    e: number;  // Elevation (0-1, 3 decimals)
    m: number;  // Moisture (0-1, 3 decimals)
    t: number;  // Temperature (0-1, 3 decimals)
    b: string;  // Biome (short string or letter code)
  }
  

@Injectable({ providedIn: 'root' })
export class FileSystemService {
  private directoryHandle: FileSystemDirectoryHandle | null = null;
  private readonly chunkSize = 512;

  constructor() {}

  async requestDirectoryAccess(): Promise<void> {
    try {
        //@ts-expect-error
      this.directoryHandle = await window.showDirectoryPicker();
      localStorage.setItem('lastDirectory', 'true'); // set a simple marker
    } catch (err) {
      console.error('User cancelled folder selection', err);
    }
  }
  
  hasDirectory(): boolean {
    return !!this.directoryHandle;
  }

  async saveChunkAsPNG(chunk: TileData[][], type: 'elevation' | 'biome' | 'structure', chunkX: number, chunkY: number): Promise<void> {
    if (!this.directoryHandle) {
      console.error('No directory selected yet.');
      return;
    }

    const filename = `chunk_${chunkX}_${chunkY}_${type}.png`;
    const canvas = this.createCanvasFromChunk(chunk, type);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));

    if (!blob) {
      console.error('Failed to create PNG blob.');
      return;
    }

    const fileHandle = await this.directoryHandle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
  }

  async saveChunkAsJSON(chunk: TileData[][], chunkX: number, chunkY: number): Promise<void> {
    if (!this.directoryHandle) {
      console.error('No directory selected yet.');
      return;
    }

    const folderHandle = await this.ensureSubfolder('maps');
    const filename = `chunk_${chunkX}_${chunkY}.json`;
    const fileHandle = await folderHandle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    const compressed = this.compressChunk(chunk);
    const json = JSON.stringify(compressed);
    await writable.write(json);
    await writable.close();
  }

  async loadOrSaveChunkJSON(
    chunkGenerator: (startX: any, startY: any, cols: any, rows: any) => TileData[][],
    chunkX: number,
    chunkY: number
  ): Promise<TileData[][]> {
    if (!this.directoryHandle) {
      throw new Error('No directory selected yet.');
    }

    const folderHandle = await this.ensureSubfolder('maps');
    const filename = `chunk_${chunkX}_${chunkY}.json`;

    try {
      const fileHandle = await folderHandle.getFileHandle(filename);
      const file = await fileHandle.getFile();
      const text = await file.text();
        const compressed = JSON.parse(text) as CompressedTile[][];
        const fullChunk = this.decompressChunk(compressed);
        return fullChunk;
    } catch (error) {
      // If file doesn't exist, generate it
      console.log(`Chunk ${chunkX},${chunkY} not found. Generating new.`);
      const newChunk = chunkGenerator(chunkX, chunkY, this.chunkSize, this.chunkSize);
      await this.saveChunkAsJSON(newChunk, chunkX, chunkY);
      return newChunk;
    }
  }
  async saveChunkAsBinary(chunk: TileData[][], chunkX: number, chunkY: number, folderName: string): Promise<void> {
    if (!this.directoryHandle) {
      console.error('No directory selected yet.');
      return;
    }
  
    const folderHandle = await this.ensureSubfolder(folderName);
    const filename = `chunk_${chunkX}_${chunkY}.bin`;
    const fileHandle = await folderHandle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    const buffer = this.encodeChunkBinary(chunk);
    await writable.write(buffer);
    await writable.close();
  }
  
  async loadOrSaveChunkBinary(generator: () => TileData[][], chunkX: number, chunkY: number, folderName: string): Promise<TileData[][]> {
    if (!this.directoryHandle) throw new Error('No directory selected yet.');
    const folderHandle = await this.ensureSubfolder(folderName);
    const filename = `chunk_${chunkX}_${chunkY}.bin`;
  
    try {
      const fileHandle = await folderHandle.getFileHandle(filename);
      const file = await fileHandle.getFile();
      const arrayBuffer = await file.arrayBuffer();
      return this.decodeChunkBinary(arrayBuffer);
    } catch (error) {
      console.log(`Chunk ${chunkX},${chunkY} not found. Generating new.`);
      const chunk = generator();
      await this.saveChunkAsBinary(chunk, chunkX, chunkY, folderName);
      return chunk;
    }
  }
  async saveJSON<T>(data: T, chunkX: number, chunkY: number, folderName: string): Promise<void> {
    if (!this.directoryHandle) {
      console.error('No directory selected yet.');
      return;
    }
  
    const folderHandle = await this.ensureSubfolder(folderName);
    const filename = `chunk_${chunkX}_${chunkY}.json`;
    const fileHandle = await folderHandle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(data));
    await writable.close();
  }
  
  async loadJSON<T>(chunkX: number, chunkY: number, folderName: string): Promise<T | undefined> {
    if (!this.directoryHandle) {
      console.error('No directory selected yet.');
      return undefined;
    }
  
    const folderHandle = await this.ensureSubfolder(folderName);
    const filename = `chunk_${chunkX}_${chunkY}.json`;
  
    try {
      const fileHandle = await folderHandle.getFileHandle(filename);
      const file = await fileHandle.getFile();
      const text = await file.text();
      return JSON.parse(text) as T;
    } catch (error) {
      console.warn(`File ${filename} not found in ${folderName}.`);
      return undefined;
    }
  }
  
  private async ensureSubfolder(name: string): Promise<FileSystemDirectoryHandle> {
    if (!this.directoryHandle) {
      throw new Error('No directory selected yet.');
    }

    try {
      return await this.directoryHandle.getDirectoryHandle(name, { create: true });
    } catch (err) {
      console.error(`Failed to create or access subfolder ${name}`, err);
      throw err;
    }
  }

  private createCanvasFromChunk(chunk: TileData[][], type: 'elevation' | 'biome' | 'structure'): HTMLCanvasElement {
    const width = chunk[0]?.length ?? 1;
    const height = chunk.length ?? 1;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    const imgData = ctx.createImageData(width, height);

    const biomeColors: Record<string, [number, number, number]> = {
      beach: [165, 250, 160],
      desert: [237, 201, 175],
      woodland: [32, 160, 16],
      taiga: [168, 240, 175],
      tundra: [216, 240, 207],
      rainforest: [0, 117, 94],
      grassland: [58, 205, 50],
      forest: [58, 139, 50],
      mountain: [136, 136, 136],
      rock: [180, 180, 180],
      alpine: [190, 210, 220],
      'alpine grassland': [143, 188, 143],
      water: [30, 144, 255],
      ocean: [0, 0, 128]
    };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const tile = chunk[y]?.[x];

        if (!tile) {
          imgData.data[i + 0] = 255;
          imgData.data[i + 1] = 0;
          imgData.data[i + 2] = 255;
          imgData.data[i + 3] = 255;
          continue;
        }

        if (type === 'elevation') {
          const shade = Math.floor(tile.elevation * 255);
          imgData.data[i + 0] = shade;
          imgData.data[i + 1] = shade;
          imgData.data[i + 2] = shade;
        } else if (type === 'biome') {
          const [r, g, b] = biomeColors[tile.biome] ?? [255, 0, 255];
          imgData.data[i + 0] = r;
          imgData.data[i + 1] = g;
          imgData.data[i + 2] = b;
        } else if (type === 'structure') {
          const hasStructure = (tile as any).structure ? 255 : 0;
          imgData.data[i + 0] = hasStructure;
          imgData.data[i + 1] = 0;
          imgData.data[i + 2] = 0;
        }

        imgData.data[i + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas;
  }

  private compressChunk(chunk: TileData[][]): CompressedTile[][] {
    return chunk.map(row =>
      row.map(tile => ({
        e: Number(tile.elevation.toFixed(3)),
        m: Number(tile.moisture.toFixed(3)),
        t: Number(tile.temperature.toFixed(3)),
        b: tile.biome
      }))
    );
  }
  
  private decompressChunk(chunk: CompressedTile[][]): TileData[][] {
    return chunk.map(row =>
      row.map(tile => ({
        elevation: tile.e,
        moisture: tile.m,
        temperature: tile.t,
        biome: this.biomeCodeMap[tile.b]
      }))
    );
  }
  private biomeCodeMap: Record<string, string> = {
    b: 'beach',
    d: 'desert',
    w: 'woodland',
    t: 'taiga',
    u: 'tundra',
    r: 'rainforest',
    g: 'grassland',
    f: 'forest',
    m: 'mountain',
    k: 'rock',
    a: 'alpine',
    l: 'alpine grassland',
    o: 'ocean',
    v: 'water'
  };
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
  
  private encodeChunkBinary(chunk: TileData[][]): ArrayBuffer {
  const width = chunk[0]?.length ?? 512;
  const height = chunk.length ?? 512;
  const buffer = new ArrayBuffer(width * height * 7); // 7 bytes per tile
  const view = new DataView(buffer);

  let index = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = chunk[y][x];
      view.setUint16(index, Math.round(tile.elevation * 1000)); index += 2;
      view.setUint16(index, Math.round(tile.moisture * 1000)); index += 2;
      view.setUint16(index, Math.round(tile.temperature * 1000)); index += 2;
      view.setUint8(index, this.biomeNameToCode(tile.biome)); index += 1;
    }
  }

  return buffer;
}
private decodeChunkBinary(buffer: ArrayBuffer): TileData[][] {
    const view = new DataView(buffer);
    const width = 512;
    const height = 512;
  
    const chunk: TileData[][] = [];
    let index = 0;
    for (let y = 0; y < height; y++) {
      const row: TileData[] = [];
      for (let x = 0; x < width; x++) {
        const elevation = view.getUint16(index) / 1000; index += 2;
        const moisture = view.getUint16(index) / 1000; index += 2;
        const temperature = view.getUint16(index) / 1000; index += 2;
        const biome = this.codeToBiomeName(view.getUint8(index)); index += 1;
        row.push({ elevation, moisture, temperature, biome });
      }
      chunk.push(row);
    }
  
    return chunk;
  }
  
}
