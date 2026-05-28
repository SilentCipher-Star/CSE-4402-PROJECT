// 0 = grass (walkable)
// 1 = tree (wall, collision)
// 2 = path (walkable)
// 3 = water (wall, collision)
// 4 = sand (walkable)

export const TILES = {
  GRASS: 0,
  TREE: 1,
  PATH: 2,
  WATER: 3,
  SAND: 4
}

export const TILE_SIZE = 48

export const level1Map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,0,0,1,1,0,0,1,1,0,0,1],
  [1,0,1,0,0,2,2,2,0,0,0,0,1,0,0,1],
  [1,0,0,0,2,2,0,2,0,0,0,0,0,0,0,1],
  [1,0,0,0,2,0,0,2,2,2,0,0,0,0,0,1],
  [1,0,1,0,2,0,1,0,0,2,0,0,1,0,0,1],
  [1,0,1,0,2,0,0,0,0,2,0,0,1,0,0,1],
  [1,0,0,0,0,0,0,0,0,2,2,2,0,0,0,1],
  [1,0,0,0,0,0,1,1,0,0,0,2,0,0,0,1],
  [1,0,1,0,0,0,1,0,0,0,0,2,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1],
  [1,0,0,1,0,0,0,0,0,0,0,2,0,0,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
]

export const eggPositions = [
  { col: 3,  row: 2,  type: 'normal' },
  { col: 7,  row: 4,  type: 'fire' },
  { col: 11, row: 6,  type: 'normal' },
  { col: 5,  row: 9,  type: 'thunder' },
  { col: 9,  row: 11, type: 'normal' },
  { col: 13, row: 13, type: 'golden' },
]

export const monsterPositions = [
  { col: 5,  row: 5  },
  { col: 10, row: 8  },
  { col: 7,  row: 12 },
]

export const exitPosition = { col: 14, row: 14 }
export const startPosition = { col: 1,  row: 1  }