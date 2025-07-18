/// <reference types="vite/client" />

export interface CellData {
  id: string
  text: string
  fontSize?: number
  fontItalic?: boolean
  fontThrough?: boolean
  fontUnderline?: boolean
  backgroundColor?: string
  flexDirection?: 'row' | 'column'
  innerGrid?: CellData[][]
}

export interface DocumentData {
  id: string
  name: string
  gridData: CellData[][]
  createdAt: string
  updatedAt: string
}
