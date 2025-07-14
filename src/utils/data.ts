import type {CellData} from "../../env";
import { customAlphabet } from 'nanoid'

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
export const lookupCellData = (gridData: CellData[][], parts: string | [number, number][]) => {
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
export const lookupInnerGrid = (gridData: CellData[][], parts: string | [number, number][]) => {
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
