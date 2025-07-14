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
