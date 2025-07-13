import type {CellData} from "../../env";

export const createGridData = (rows: number, cols: number): CellData[][] => {
  return new Array(rows).fill(0).map( () =>
    new Array(cols).fill(0).map(() => {
      return {
        text: '',
      }
    })
  );
}
