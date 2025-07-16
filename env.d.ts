/// <reference types="vite/client" />

export interface CellData{
  id: string;
  text: string;
  fontSize?: number;
  backgroundColor?: string;
  flexDirection?: 'row' | 'column';

  innerGrid?: CellData[][]
}
