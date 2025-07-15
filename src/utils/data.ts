import type {CellData} from "../../env";
import { customAlphabet } from 'nanoid'

type PathString = string // format like: [0,1]>[2,3]>[4,5]
type PathNumber = [number, number][]

export const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 8)

export const createGridData = (rows: number, cols: number): CellData[][] => {
  return new Array(rows).fill(0).map( () =>
    createRowData(cols)
  );
}
export const createRowData = (cols: number): CellData[] => {
  return new Array(cols).fill(0).map(() => {
    return createCellData();
  });
}
export const createCellData = (): CellData => {
  return {
    id: nanoid(),
    text: '',
  }
}
export const lookupCellData = (gridData: CellData[][], parts: PathString | PathNumber) => {
  if(!parts.length){
    return null
  }
  if (typeof parts === 'string') {
    parts = parts.split('>').map((it) => JSON.parse(it))
  }
  return parts.reduce((acc, cur) => {
    const [row, col] = cur
    const it = acc.innerGrid![row][col]
    return it
  }, { text: '', innerGrid: gridData } as CellData)
}
export const lookupInnerGrid = (gridData: CellData[][], parts: PathString | PathNumber) => {
  if(!parts.length){
    return gridData
  }
  if (typeof parts === 'string') {
    parts = parts.split('>').map((it) => JSON.parse(it))
  }
  return parts.reduce((acc, cur) => {
    const [row, col] = cur
    const it = acc[row][col]
    return it.innerGrid || []
  }, gridData)
}
export const pickGridData = (gridData: CellData[][], paths: PathString[] | PathNumber[], clipText = true) => {
  if(!paths.length){
    return []
  }
  if(!gridData.length){
    return []
  }
  return paths.map((it) => {
    if(typeof it === 'string'){
      return it.split('>').map((it2) => JSON.parse(it2) as [number, number])
    }
    return it
  }).map(it => {
    const pos = it[it.length - 1]
    const cell = lookupCellData(gridData, it)!
    const data = JSON.parse(JSON.stringify(cell))
    if(clipText) {
      cell.text = ''
      cell.innerGrid = undefined
    }
    return { pos, data }
  }).reduce((acc, cur) => {
    const [row, col] = cur.pos
    acc[row] = acc[row] || []
    acc[row][col] = JSON.parse(JSON.stringify(cur.data))
    return acc
  }, [] as CellData[][]).filter(it =>
    it && it.length
  ).map(it => {
    return it.filter(Boolean)
  })
}
