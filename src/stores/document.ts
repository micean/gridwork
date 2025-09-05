
import { defineStore } from 'pinia'
import { ref } from 'vue'
import emitter from "@/utils/bus.ts";
import type { CellData, DocumentData } from '../../env'
import {
  createGridData,
  lookupCellData, lookupInnerGrid,
  nanoid,
  tryLookupInnerGrid
} from '@/utils/data.ts'
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
  const originalGridData = ref<CellData[][]>([])
  const zoomScalePath = ref('')
  const createdAt = ref<string>(new Date().toUTCString())
  const selectedCells = ref<string[]>([])
  const editingCell = ref<string | null>(null)
  const mouseCells = ref<{
    startCell?: string,
    endCell?: string,
    mouseupEvent?: () => void
    oldSelectedCells?: string[]
  }>({})
  const lastClickedCell = ref<string | null>(null)
  const previewBorders = ref<{
    position: 'top' | 'bottom' | 'left' | 'right' | null
    targetCells: string[]
  }[]>([])

  const loadDoc = (doc: DocumentData) => {
    id.value = doc.id
    title.value = doc.name
    createdAt.value = doc.createdAt
    setupGrid(doc.gridData)
  }

  const isZoomed = () => {
    return originalGridData.value.length > 0 && zoomScalePath.value.length > 0
  }

  const setupGrid = (data: CellData[][]) => {
    if(isZoomed()) {
      originalGridData.value = data.length ? data : createGridData(1, 1)
      const { realGridData, realParts } = tryLookupInnerGrid(
        originalGridData.value,
        zoomScalePath.value.split('>').map((it) => JSON.parse(it) as [number, number])
      )
      gridData.value = realGridData
      zoomScalePath.value = realParts.map(it => JSON.stringify(it)).join('>')
      selectedCells.value = tryLookupInnerGrid(
        gridData.value,
        selectedCells.value.map(it => JSON.parse(it))
      ).realParts.map(it => JSON.stringify(it))
      return
    }
    gridData.value = data.length ? data : createGridData(1, 1)
  }

  const updateDocumentName = (name: string) => {
    title.value = name
  }

  const getDocument = (): DocumentData => {
    return {
      id: id.value,

      name: title.value,
      gridData: JSON.parse(JSON.stringify(isZoomed() ? originalGridData.value : gridData.value)),
      createdAt: createdAt.value,
      updatedAt: new Date().toUTCString()
    }
  }

  const saveDocument = async (dbManager: IndexedDBManager | null) => {
    if(isZoomed())
      return
    try {
      const doc = getDocument();
      const documentId = await dbManager?.put(DOCUMENTS_STORE, doc)
      if(documentId){
        console.log('document saved', documentId, doc)
        localStorage.setItem('lastDocumentId', documentId.toString())
      }
      return documentId
    } catch (error) {
      console.error('failed to save document:', error)
      throw error
    }
  }

  const addCellOnClick = (cell: string) => {
    if (isCellSelected(cell) && selectedCells.value.length === 1) {
      return
    }
    setSelectedCells([cell])
  }

  const removeSelectedCell = (cell: string) => {
    const index = selectedCells.value.indexOf(cell)
    if (index > -1) {
      selectedCells.value.splice(index, 1)
    }
  }

  const toggleSelectCell = (cell: string) => {
    if (isCellSelected(cell)) {
      removeSelectedCell(cell)
    } else {
      addCellOnClick(cell)
    }
  }

  const zoomIn = () => {
    if(!selectedCells.value.length)
      return
    const selectedParts = selectedCells.value[0].split('>')
    if(selectedParts.length < 2)
      return
    const rootPart = selectedParts[0]
    if(!isZoomed()){
      originalGridData.value = gridData.value;
      zoomScalePath.value = rootPart;
      selectedCells.value = selectedCells.value.map(it => {
        const parts = it.split('>')
        parts[0] = '[0,0]'
        return parts.join('>')
      }).filter(it => it.includes('>'))
    }else{
      zoomScalePath.value += '>' + selectedParts[1];
      selectedCells.value = selectedCells.value.map(it => {
        const parts = it.split('>').slice(1)
        parts[0] = '[0,0]'
        return parts.join('>')
      }).filter(it => it.includes('>'))
    }
    const root = lookupCellData(originalGridData.value, zoomScalePath.value)!
    gridData.value = [[root]]
  }

  const zoomOut = () => {
    if(!isZoomed())
      return
    const zoomParts = zoomScalePath.value.split('>')
    const parentPart = zoomParts.pop()
    zoomScalePath.value = zoomParts.join('>')
    selectedCells.value = parentPart ? selectedCells.value.map(it => {
      const parts = it.split('>')
      parts[0] = '[0,0]>' + parentPart
      return parts.join('>')
    }).filter(it => it.includes('>')) : selectedCells.value
    if(zoomScalePath.value.length){
      const root = lookupCellData(originalGridData.value, zoomScalePath.value)!
      gridData.value = [[root]]
    }else{
      exitZoom();
    }
  }

  const exitZoom = () => {
    if(zoomScalePath.value){
      selectedCells.value = selectedCells.value.map(it => {
        const parts = it.split('>')
        parts[0] = zoomScalePath.value
        return parts.join('>')
      })
    }
    zoomScalePath.value = ''
    gridData.value = originalGridData.value
    originalGridData.value = []
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
    lastClickedCell.value = null
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
    selectedCells.value.splice(0, selectedCells.value.length)
    selectedCells.value.push(...cells)
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
    lastClickedCell.value = cell
    mouseCells.value.mouseupEvent = () => {
      window.removeEventListener('mouseup', mouseCells.value.mouseupEvent!)
      if(mouseCells.value.oldSelectedCells?.length === selectedCells.value.length
        && mouseCells.value.oldSelectedCells?.length === 1
        && mouseCells.value.oldSelectedCells[0] === selectedCells.value[0]) {
        window.dispatchEvent(new CustomEvent('selected-cell-click', {detail: {path: mouseCells.value.startCell}}));
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
    const rowSize = posArr.map(it => it

      [0]).filter((e, i, self) => i === self.indexOf(e)).length;
    const colSize = posArr.map(it => it[1]).filter((e, i, self) => i === self.indexOf(e)).length;
    return [rowSize, colSize]
  }

  // 判断两个cell是否在同一层
  const areCellsOnSameLevel = (cell1: string, cell2: string): boolean => {
    const parts1 = cell1.split('>')
    const parts2 = cell2.split('>')

    // 如果层级数不同，则不在同一层
    if (parts1.length !== parts2.length) {
      return false
    }

    // 检查除了最后一层之外的所有父级路径是否相同
    for (let i = 0; i < parts1.length - 1; i++) {
      if (parts1[i] !== parts2[i]) {
        return false
      }
    }

    return true
  }

  // Shift+点击选择范围
  const handleShiftClick = (targetCell: string) => {
    // 检查是否在同一层
    if (lastClickedCell.value && areCellsOnSameLevel(lastClickedCell.value, targetCell)) {
      // 计算选择范围
      const rangeCells = thoughtCells(lastClickedCell.value, targetCell)
      selectedCells.value = rangeCells
      return
    }

    addCellOnClick(targetCell)
    lastClickedCell.value = targetCell
  }

  // Shift+方向键增加/减少当前选定范围
  const handleShiftArrow = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!selectedCells.value.length || !lastClickedCell.value) {
      return
    }

    // 获取当前选择范围的边界
    const startCell = lastClickedCell.value

    // 计算当前选择矩形的真正对角点
    let currentEndCell: string
    if (selectedCells.value.length === 1) {
      // 如果只选中一个单元格，对角点就是自己
      currentEndCell = startCell
    } else {
      // 计算当前选择范围的实际边界
      const startParts = startCell.split('>')
      const [startRow, startCol] = JSON.parse(startParts[startParts.length - 1])
      const prefix = startParts.slice(0, -1).length ? startParts.slice(0, -1).join('>') + '>' : ''

      // 找到选择范围中的最大和最小坐标
      let minRow = startRow, maxRow = startRow, minCol = startCol, maxCol = startCol
      selectedCells.value.forEach(cell => {
        const cellParts = cell.split('>')
        const [row, col] = JSON.parse(cellParts[cellParts.length - 1])
        minRow = Math.min(minRow, row)
        maxRow = Math.max(maxRow, row)
        minCol = Math.min(minCol, col)
        maxCol = Math.max(maxCol, col)
      })

      // 对角点是距离起始点最远的点
      const endRow = startRow === minRow ? maxRow : minRow
      const endCol = startCol === minCol ? maxCol : minCol
      currentEndCell = `${prefix}[${endRow},${endCol}]`
    }

    // 获取当前层
    const parts = startCell.split(">")
    const innerGrid = parts.length === 1 ? gridData.value
      : lookupInnerGrid(gridData.value, parts.slice(0, parts.length - 1).join(">"))

    // 根据方向计算新的目标单元格
    let newEndCell = currentEndCell
    const endParts = currentEndCell.split('>')
    const [endRow, endCol] = JSON.parse(endParts.pop() || '[-1,-1]')
    const prefix = endParts.length ? endParts.join('>') + '>' : ''

    if (endRow === -1 || endCol === -1) return

    switch (direction) {
      case 'up':
        newEndCell = `${prefix}[${Math.max(0, endRow - 1)},${endCol}]`
        break
      case 'down':
        const maxRow = innerGrid.length - 1
        newEndCell = `${prefix}[${Math.min(maxRow, endRow + 1)},${endCol}]`
        break
      case 'left':
        newEndCell = `${prefix}[${endRow},${Math.max(0, endCol - 1)}]`
        break
      case 'right':
        const maxCol =

        innerGrid[0]?.length ? innerGrid[0].length - 1 : 0
        newEndCell = `${prefix}[${endRow},${Math.min(maxCol, endCol + 1)}]`
        break
    }

    // 使用 thoughtCells 计算新的选择范围
    selectedCells.value = thoughtCells(startCell, newEndCell)
  }

  const setPreviewBorders = (type: 'row' | 'col' | null, position: 'top' | 'bottom' | 'left' | 'right' | null) => {
    if (!type || !position) {
      previewBorders.value = []
      return
    }

    if (!selectedCells.value.length) {
      previewBorders.value =[]
      return
    }

    const startSelectedCell = selectedCells.value[0]
    const startParts = startSelectedCell.split('>')
    const [startRow, startCol] = JSON.parse(startParts.pop()!)

    const endSelectedCell = selectedCells.value[selectedCells.value.length - 1]
    const endParts = endSelectedCell.split('>')
    const [endRow, endCol] = JSON.parse(endParts.pop()!)

    const prefix = startParts.length ? startParts.join('>') + '>' : ''

    const targetCells1: string[] = []
    const targetCells2: string[] = []
    const grid = endParts.length ? lookupInnerGrid(gridData.value, startParts.join('>')) : gridData.value

    switch (type) {
      case 'row':
        if (position === 'top') {
          // 高亮当前行的顶部边框和上一行(如果存在)的底部边框
          for (let c = 0; c < grid[0].length; c++) {
            targetCells1.push(`${prefix}[${startRow},${c}]`)
          }
          previewBorders.value.push({ position: 'top', targetCells: targetCells1 })
          if(startRow > 0){
            for (let c = 0; c < grid[0].length; c++) {
              targetCells2.push(`${prefix}[${startRow - 1},${c}]`)
            }
            previewBorders.value.push({ position: 'bottom', targetCells: targetCells2 })
          }
        } else if (position === 'bottom') {
          // 高亮当前行的底部边框和下一行(如果存在)的顶部边框
          for (let c = 0; c < grid[0].length; c++) {
            targetCells1.push(`${prefix}[${endRow},${c}]`)
          }
          previewBorders.value.push({ position: 'bottom', targetCells: targetCells1 })
          if(endRow < grid.length - 1){
            for (let c = 0; c < grid[0].length; c++) {
              targetCells2.push(`${prefix}[${endRow + 1},${c}]`)
            }
            previewBorders.value.push({ position: 'top', targetCells: targetCells2 })
          }
        }
        break
      case 'col':
        if (position === 'left') {
          // 高亮当前列的左侧边框和前一行(如果存在)的右侧边框
          for (let r = 0; r < grid.length; r++) {
            targetCells1.push(`${prefix}[${r},${startCol}]`)
          }
          previewBorders.value.push({ position: 'left', targetCells: targetCells1 })
          if(startCol > 0){
            for (let r = 0; r < grid.length; r++) {
              targetCells2.push(`${prefix}[${r},${startCol - 1}]`)
            }
            previewBorders.value.push({ position: 'right', targetCells: targetCells2 })
          }
        } else if (position === 'right') {
          // 高亮当前列的右侧边框和后一行(如果存在)的左侧边框
          for (let r = 0; r < grid.length; r++) {
            targetCells1.push(`${prefix}[${r},${endCol}]`)
          }
          previewBorders.value.push({ position: 'right', targetCells: targetCells1 })
          if(endCol < grid[0].length - 1){
            for (let r = 0; r < grid.length; r++) {
              targetCells2.push(`${prefix}[${r},${endCol + 1}]`)
            }
            previewBorders.value.push({ position: 'left', targetCells: targetCells2 })
          }
        }
        break
    }
    console.log(JSON.stringify(previewBorders.value))
  }

  const isPreviewBorder = (cell: string, border: 'top' | 'bottom' | 'left' | 'right'): boolean => {
    if (!previewBorders.value.length) return false

    // 根据操作类型和位置返回对应的边框
    for (let i = 0; i < previewBorders.value.length; i++) {
      const previewBorder = previewBorders.value[i];
      if(previewBorder.position !== border){
        continue;
      }
      if(!previewBorder.targetCells.includes(cell)){
        continue;
      }
      return true;
    }
    return false;
  }

  return {
    id,
    title,
    gridData,
    originalGridData,
    zoomScalePath,
    selectedCells,
    editingCell,
    mouseCells,
    lastClickedCell,
    previewBorders,
    loadDoc,
    setupGrid,
    updateDocumentName,
    getDocument,
    saveDocument,
    addCellOnClick,
    removeCell: removeSelectedCell,
    toggleCell: toggleSelectCell,
    isZoomed,
    zoomIn,
    zoomOut,
    exitZoom,
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
    areCellsOnSameLevel,
    handleShiftClick,
    handleShiftArrow,
    setPreviewBorders,
    isPreviewBorder
  }
})

