import { Injectable } from '@angular/core';
import { CellData, Tile } from './worldGeneration/world-map.service';
import { TileSerializationService } from './tiles/tile-serialization.service';

interface CompressedCellData {
  e: number; // elevation
  m: number; // moisture
  t: number; // temperature
  b: string; // biome code
  tiles?: string[][][]; // sprite names
}

@Injectable({ providedIn: 'root' })
export class FileSystemService {
  private directoryHandle: FileSystemDirectoryHandle | null = null;
  private readonly chunkSize = 512;
  private readonly tilesPerCellX = 2;
  private readonly tilesPerCellY = 2;
  private readonly layerCount = 3;
  private readonly spriteList = ['grass', 'tree', 'water', 'rock', 'road', 'empty'];

  constructor(private tileSerializer: TileSerializationService) {}

  async requestDirectoryAccess(): Promise<void> {
    //@ts-expect-error
    this.directoryHandle = await window.showDirectoryPicker();
  }

  private spriteNameToIndex(name: string): number {
    let idx = this.spriteList.indexOf(name);
    if (idx === -1) {
      idx = this.spriteList.length;
      this.spriteList.push(name);
    }
    return idx;
  }

  hasDirectory(): boolean {
    return !!this.directoryHandle;
  }
  private indexToSprite(idx: number): string {
    return this.spriteList[idx] ?? 'unknown';
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

  private createEmptyTiles(): Tile[][][] {
    return Array.from({ length: this.layerCount }, () =>
      Array.from({ length: this.tilesPerCellY }, () =>
        Array.from({ length: this.tilesPerCellX }, () => ({
          sprite: '',
        }))
      )
    );
  }

  // JSON COMPRESS
  private compressChunk(chunk: CellData[][]): CompressedCellData[][] {
    return chunk.map(row =>
      row.map(cell => ({
        e: Number(cell.elevation.toFixed(3)),
        m: Number(cell.moisture.toFixed(3)),
        t: Number(cell.temperature.toFixed(3)),
        b: cell.biome,
        tiles: this.tileSerializer.serializeTiles(cell.tiles)
      }))
    );
  }

  // JSON DECOMPRESS
  private decompressChunk(compressed: CompressedCellData[][]): CellData[][] {
    return compressed.map(row =>
      row.map(c => ({
        elevation: c.e,
        moisture: c.m,
        temperature: c.t,
        biome: this.biomeCodeMap[c.b] ?? c.b,
        tiles: c.tiles
          ? this.tileSerializer.deserializeTiles(c.tiles)
          : this.createEmptyTiles()
      }))
    );
  }

  // BINARY ENCODE
  private encodeChunkBinary(chunk: CellData[][]): ArrayBuffer {
    const width = chunk[0]?.length ?? this.chunkSize;
    const height = chunk.length ?? this.chunkSize;
    const tileCount = this.layerCount * this.tilesPerCellY * this.tilesPerCellX;
    const bytesPerCell = 2 + 2 + 2 + 1 + 2 * tileCount;
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
        if(cell.tiles) {
            for (let l = 0; l < this.layerCount; l++) {
            for (let ty = 0; ty < this.tilesPerCellY; ty++) {
                for (let tx = 0; tx < this.tilesPerCellX; tx++) {
                const spriteIdx = this.spriteNameToIndex(cell.tiles[l][ty][tx].sprite);
                view.setUint16(i, spriteIdx); i += 2;
              }
            }
          }
        }
      }
    }
    return buffer;
  }

  // BINARY DECODE
  private decodeChunkBinary(buffer: ArrayBuffer): CellData[][] {
    const view = new DataView(buffer);
    const width = this.chunkSize;
    const height = this.chunkSize;
    const chunk: CellData[][] = [];
    const tileCount = this.layerCount * this.tilesPerCellY * this.tilesPerCellX;
    const bytesPerCell = 2 + 2 + 2 + 1 + 2 * tileCount;
    let i = 0;

    for (let y = 0; y < height; y++) {
      const row: CellData[] = [];
      for (let x = 0; x < width; x++) {
        const elevation = view.getUint16(i) / 1000; i += 2;
        const moisture = view.getUint16(i) / 1000; i += 2;
        const temperature = view.getUint16(i) / 1000; i += 2;
        const biome = this.codeToBiomeName(view.getUint8(i)); i += 1;
        const tiles: Tile[][][] = this.createEmptyTiles();

        for (let l = 0; l < this.layerCount; l++) {
          for (let ty = 0; ty < this.tilesPerCellY; ty++) {
            for (let tx = 0; tx < this.tilesPerCellX; tx++) {
              const spriteIdx = view.getUint16(i);
              tiles[l][ty][tx].sprite = this.indexToSprite(spriteIdx);
              i += 2;
            }
          }
        }

        row.push({ elevation, moisture, temperature, biome, tiles });
      }
      chunk.push(row);
    }
    return chunk;
  }

  // FILE I/O

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

  // UTILS

  private async getFileHandle(name: string, folder: string): Promise<FileSystemFileHandle> {
    if (!this.directoryHandle) throw new Error('No directory selected');
    const dir = await this.directoryHandle.getDirectoryHandle(folder, { create: true });
    return await dir.getFileHandle(name, { create: true });
  }

  createCanvasFromChunk(chunk: CellData[][], type: 'elevation' | 'biome'): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const width = chunk[0]?.length ?? 1;
    const height = chunk.length ?? 1;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    const img = ctx.createImageData(width, height);

    const biomeColors: Record<string, [number, number, number]> = {
      beach: [165, 250, 160], desert: [237, 201, 175], woodland: [32, 160, 16],
      taiga: [168, 240, 175], tundra: [216, 240, 207], rainforest: [0, 117, 94],
      grassland: [58, 205, 50], forest: [58, 139, 50], mountain: [136, 136, 136],
      rock: [180, 180, 180], alpine: [190, 210, 220], 'alpine grassland': [143, 188, 143],
      water: [30, 144, 255], ocean: [0, 0, 128]
    };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const cell = chunk[y]?.[x];
        const shade = Math.floor((cell?.elevation ?? 0) * 255);
        if (type === 'elevation') {
          img.data.set([shade, shade, shade, 255], i);
        } else {
          const [r, g, b] = biomeColors[cell?.biome ?? 'ocean'] ?? [255, 0, 255];
          img.data.set([r, g, b, 255], i);
        }
      }
    }
    ctx.putImageData(img, 0, 0);
    return canvas;
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
}
