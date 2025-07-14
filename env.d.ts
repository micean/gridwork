/// <reference types="vite/client" />

export interface CellData{
  id: string;
  text: string;
  innerGrid?: CellData[][]
}
