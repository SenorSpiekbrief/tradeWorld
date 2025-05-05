export const TILES_PER_CELL = 512;
export const CELLS_PER_CHUNK = 512;

export function worldToIndices(wx: number, wy: number) {
  const tileX  = wx;
  const tileY  = wy;
  const cellX  = Math.floor(tileX / TILES_PER_CELL);
  const cellY  = Math.floor(tileY / TILES_PER_CELL);
  const chunkX = Math.floor(cellX / CELLS_PER_CHUNK);
  const chunkY = Math.floor(cellY / CELLS_PER_CHUNK);
  return {
    chunkX, chunkY,
    cellX:  cellX & (CELLS_PER_CHUNK - 1),
    cellY:  cellY & (CELLS_PER_CHUNK - 1),
    tileX:  tileX & (TILES_PER_CELL - 1),
    tileY:  tileY & (TILES_PER_CELL - 1),
  };
}