/// <reference types="vite/client" />

export interface CellData{
  id: string;
  text: string;
  fontSize?: number;
  backgroundColor?: string;
  innerGrid?: CellData[][]
}
