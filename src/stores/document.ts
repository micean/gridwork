import { defineStore } from 'pinia'
import { ref } from 'vue'
import emitter from "@/utils/bus.ts";
import type { CellData, DocumentData } from '../../env'
import { nanoid } from '@/utils/data.ts'
import { DOCUMENTS_STORE, type IndexedDBManager } from '@/utils/db.ts'

const compareCellPath = (startCellParts: string[], endCellParts: string[], length: number) => {
  if(length === 1) return length;
  for (let i = 0; i < length; i++) {
    if (startCellParts[i] !== endCellParts[i]) {
      return i + 1;
    }
  }
  return length;
}
const thoughtCells = (startCell?: string, endCell?: string): string[] => {
  if(!startCell && !endCell) return []
  if(!endCell) return [startCell!]
  if(!startCell) return [endCell!]
  if(startCell === endCell) return [startCell]

  const startCellParts = startCell.split('>')
  const endCellParts = endCell.split('>')
  const index = compareCellPath(startCellParts, endCellParts, Math.min(startCellParts.length, endCellParts.length)) - 1;
  const [startX, startY] = JSON.parse(startCellParts[index])
  const [endX, endY] = JSON.parse(endCellParts[index])
  const cells: string[] = []
  for (let i = Math.min(startX, endX); i <= Math.max(startX, endX); i++) {
    for (let j = Math.min(startY, endY); j <= Math.max(startY, endY); j++) {
      cells.push(`[${i},${j}]`)
    }
  }
  return cells.map(it => startCellParts.slice(0, index).concat([it]).join('>'))
}
const clearDocumentFocus = () => {
  if(document.activeElement){
    const activeElement = document.activeElement as HTMLElement
    activeElement.blur()
  }
}

export const useDocumentStore = defineStore('document', () => {
  const id = ref<string>(nanoid())
  const title = ref<string>('')
  const gridData = ref<CellData[][]>([])
  const createdAt = ref<string>(new Date().toUTCString())
  const selectedCells = ref<string[]>([])
  const editingCell = ref<string | null>(null)
  const mouseCells = ref<{
    startCell?: string,
    endCell?: string,
    mouseupEvent?: () => void
    oldSelectedCells?: string[]
  }>({})

  const loadDoc = (doc: DocumentData) => {
    id.value = doc.id
    title.value = doc.name
    createdAt.value = doc.createdAt
    setupGrid(doc.gridData)
  }

  const setupGrid = (data: CellData[][]) => {
    gridData.value = data
  }

  const updateDocumentName = (name: string) => {
    title.value = name
  }

  const getDocument = (): DocumentData => {
    return {
      id: id.value,
      name: title.value,
      gridData: JSON.parse(JSON.stringify(gridData.value)),
      createdAt: createdAt.value,
      updatedAt: new Date().toUTCString(),
    }
  }

  const saveDocument = async (dbManager: IndexedDBManager | null) => {
    try {
      const doc = getDocument();
      const documentId = await dbManager?.put(DOCUMENTS_STORE, doc)
      if(documentId){
        console.log('文档保存成功', documentId, doc)
        localStorage.setItem('lastDocumentId', documentId.toString())
      }
      return documentId
    } catch (error) {
      console.error('保存项目失败:', error)
      throw error
    }
  }

  const addCellOnClick = (cell: string) => {
    if (isCellSelected(cell) && selectedCells.value.length === 1) {
      return
    }
    selectedCells.value.splice(0, selectedCells.value.length)
    selectedCells.value.push(cell)
  }

  const removeCell = (cell: string) => {
    const index = selectedCells.value.indexOf(cell)
    if (index > -1) {
      selectedCells.value.splice(index, 1)
    }
  }

  const toggleCell = (cell: string) => {
    if (isCellSelected(cell)) {
      removeCell(cell)
    } else {
      addCellOnClick(cell)
    }
  }

  const selectParentOrClear = () => {
    if(selectedCells.value.length === 1) {
      const parts = selectedCells.value[0].split('>')
      parts.pop()
      if(parts.length === 0) {
        clearSelection()
        return
      }
      selectedCells.value = [parts.join('>')]
    }else{
      clearSelection()
    }
  }

  const clearSelection = () => {
    selectedCells.value = []
  }

  const isCellSelected = (cell: string) => {
    return selectedCells.value.includes(cell)
  }

  const selectedBorder = (cell: string, pos: 'top' | 'bottom' | 'left' | 'right') => {
    const parts = cell.split('>')
    const [row, col] = JSON.parse(parts.pop()!)
    const prefix = parts.length ? parts.join('>') + '>' : ''
    switch(pos) {
      case 'top':
        return !isCellSelected(prefix + `[${row - 1},${col}]`)
      case 'bottom':
        return !isCellSelected(prefix + `[${row + 1},${col}]`)
      case 'left':
        return !isCellSelected(prefix + `[${row},${col - 1}]`)
      case 'right':
        return !isCellSelected(prefix + `[${row},${col + 1}]`)
    }
  }

  const getSelectedCells = () => selectedCells.value

  const setSelectedCells = (cells: string[]) => {
    selectedCells.value = cells
  }

  const startEdit = () => {
    if(selectedCells.value.length) {
      const path = selectedCells.value[0]
      selectedCells.value.splice(1, selectedCells.value.length)
      emitter.emit('cell-focus', {path, startEdit: true})
    }
  }

  const focusAnotherCell = (direction: 'up' | 'down' | 'left' | 'right', startEdit = false) => {
    if(selectedCells.value.length) {
      const firstCell = selectedCells.value[0]
      const signCell = ['up', 'left'].includes(direction) ? firstCell :
        'right' === direction ? selectedCells.value.filter(it => JSON.parse(it.split('>').pop()!)[0] === JSON.parse(firstCell.split('>').pop()!)[0]).pop()! :
        'down' === direction ? selectedCells.value.filter(it => JSON.parse(it.split('>').pop()!)[1] === JSON.parse(firstCell.split('>').pop()!)[1]).pop()! :
          firstCell
      const posArr = signCell.split('>')
      const [row, col] = JSON.parse(posArr.pop() || '[-1,-1]')
      if(row === -1 || col === -1) return
      const prefix = posArr.length ? posArr.join('>') + '>' : ''
      switch(direction) {
        case 'up':
          emitter.emit('cell-focus', {path: `${prefix}[${row - 1},${col}]`, startEdit})
          break;
        case 'down':
          emitter.emit('cell-focus', {path: `${prefix}[${row + 1},${col}]`, startEdit})
          break;
        case 'left':
          emitter.emit('cell-focus', {path: `${prefix}[${row},${col - 1}]`, startEdit})
          break;
        case 'right':
          emitter.emit('cell-focus', {path: `${prefix}[${row},${col + 1}]`, startEdit})
          break;
      }
    }
  }

  const setMouseStartCell = (cell: string) => {
    if(mouseCells.value.startCell) return;

    mouseCells.value.oldSelectedCells = selectedCells.value
    mouseCells.value.startCell = cell
    mouseCells.value.mouseupEvent = () => {
      window.removeEventListener('mouseup', mouseCells.value.mouseupEvent!)
      if(mouseCells.value.oldSelectedCells?.length === selectedCells.value.length
        && mouseCells.value.oldSelectedCells?.length === 1
        && selectedCells.value[0] === mouseCells.value.oldSelectedCells[0]) {
        window.dispatchEvent(new CustomEvent('cell-click', {detail: {path: mouseCells.value.startCell}}));
      }else{
        clearDocumentFocus();
      }
      mouseCells.value.startCell = undefined
      mouseCells.value.endCell = undefined
      mouseCells.value.mouseupEvent = undefined
      mouseCells.value.oldSelectedCells = undefined
    }
    window.addEventListener('mouseup', mouseCells.value.mouseupEvent)
    selectedCells.value = thoughtCells(mouseCells.value.startCell, mouseCells.value.endCell)
  }
  const setMouseEndCell = (cell: string) => {
    if(!mouseCells.value.startCell) return;

    mouseCells.value.endCell = cell
    selectedCells.value = thoughtCells(mouseCells.value.startCell, mouseCells.value.endCell)
    if(selectedCells.value.length > 1) {
      clearDocumentFocus();
    }
  }

  const setEditingCell = (cell: string | null) => {
    editingCell.value = cell
  }

  const isEditingCell = (cell: string) => {
    return editingCell.value === cell
  }

  const countSelectedRowColSize = () => {
    const posArr: [number, number][] = selectedCells.value
      .map(it => it.split('>').pop()!)
      .map(it => JSON.parse(it) as [number, number])
    const rowSize = posArr.map(it => it[0]).filter((e, i, self) => i === self.indexOf(e)).length;
    const colSize = posArr.map(it => it[1]).filter((e, i, self) => i === self.indexOf(e)).length;
    return [rowSize, colSize]
  }

  return {
    id,
    title,
    gridData,
    selectedCells,
    editingCell,
    loadDoc,
    setupGrid,
    updateDocumentName,
    getDocument,
    saveDocument,
    addCellOnClick,
    removeCell,
    toggleCell,
    selectParentOrClear,
    clearSelection,
    isCellSelected,
    selectedBorder,
    getSelectedCells,
    setSelectedCells,
    startEdit,
    focusAnotherCell,
    setMouseStartCell,
    setMouseEndCell,
    setEditingCell,
    isEditingCell,
    countSelectedRowColSize,
  }
})
