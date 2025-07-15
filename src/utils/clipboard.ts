import { useSelectedCellsStore } from '@/stores/selectedCells.ts'
import { createCellData, createRowData, lookupCellData, lookupInnerGrid } from '@/utils/data.ts'
import type { CellData } from '../../env'

export const pasteEventListener = async (event: ClipboardEvent) => {
  const selectedCellsStore = useSelectedCellsStore()
  // 如果有单元格正在编辑，不处理粘贴事件
  if (selectedCellsStore.editingCell || !selectedCellsStore.selectedCells.length) {
    return
  }

  // 阻止默认粘贴行为
  event.preventDefault()

  try {
    const clipboardText: {
      original: string
      isGrid: boolean
      gridText: string[][]
    } = {
      original: '',
      isGrid: false,
      gridText: [],
    }

    // 尝试多种方式获取剪贴板内容
    if (event.clipboardData) {
      // 使用事件对象的clipboardData（更可靠）
      clipboardText.original = event.clipboardData.getData('text/plain')

      const htmlText = event.clipboardData.getData('text/html')
      if(htmlText){
        // 检测是否是表格，如果是，获取表格数据放在gridText中，并设置isGrid为true
        const parser = new DOMParser()
        const doc = parser.parseFromString(htmlText, 'text/html')
        const tables = doc.querySelectorAll('table')

        if (tables.length > 0) {
          for (let i = 0; i < tables.length; i++) {
            const table = tables[i]
            const rows = table.querySelectorAll('tr')
            const grid = Array.from(rows).map(row => {
              const cells = row.querySelectorAll('td, th')
              return Array.from(cells).map(cell => cell.textContent || '')
            })
            clipboardText.gridText.push(...grid)
          }
          clipboardText.isGrid = true
        }
      }
    } else if (navigator.clipboard) {
      // 使用navigator.clipboard API
      clipboardText.original = await navigator.clipboard.readText()
    }
    if(!clipboardText.isGrid){
      // 检测是否是表格，方式：是否有\t或\n，如果是，获取表格数据放在gridText中，并设置isGrid为true
      const text = clipboardText.original
      if (text.includes('\t') || text.includes('\n')) {
        clipboardText.gridText = text.replace(/\r/g, '').split('\n').map(row => row.split('\t'))
        clipboardText.isGrid = true
      }
    }

    if (clipboardText && selectedCellsStore.selectedCells.length > 0) {
      // 将剪贴板内容填入所有选定的单元格
      if(!clipboardText.isGrid){
        console.log(clipboardText.gridText)
        selectedCellsStore.selectedCells.map(it =>
          lookupCellData(selectedCellsStore.gridData, it)!
        ).forEach(cell => {
            cell.text = clipboardText.original
        })
      } else {
        // 将gridText填入选定的单元格
        const selectedCells = selectedCellsStore.selectedCells

        const startCell = selectedCells[0]
        const startCellParts = startCell.split('>').map(it => JSON.parse(it) as [number, number])
        const [startRow, startCol] = startCellParts.pop()!
        const parentGrid: CellData[][] = lookupInnerGrid(selectedCellsStore.gridData, startCellParts)
        if (selectedCells.length === 1) {
          // 单个单元格：以该单元格为起点填充表格数据
          clipboardText.gridText.forEach((rowData, rowIndex) => {
            const targetRow = startRow + rowIndex
            if(parentGrid.length <= targetRow){
              parentGrid.push(createRowData(parentGrid[0].length))
            }
            rowData.forEach((cellData, colIndex) => {
              const targetCol = startCol + colIndex
              if(parentGrid[targetRow].length <= targetCol){
                parentGrid.forEach(row => row.push(createCellData()))
              }

              const cellPath = startCellParts.concat([[targetRow, targetCol]])
              const cell = lookupCellData(selectedCellsStore.gridData, cellPath)
              if (cell) {
                cell.text = cellData
              }
            })
          })
        } else {
          // 多个单元格：仅在选定范围内填充数据
          clipboardText.gridText.forEach((rowData, rowIndex) => {
            const targetRow = startRow + rowIndex
            rowData.forEach((cellData, colIndex) => {
              const targetCol = startCol + colIndex
              const cellPath = startCellParts.concat([[targetRow, targetCol]]).map(it => JSON.stringify(it)).join('>')
              if(!selectedCells.includes(cellPath)){
                return
              }
              const cell = lookupCellData(selectedCellsStore.gridData, cellPath)
              if (cell) {
                cell.text = cellData
              }
            })
          })
        }
      }

    }
  } catch (error) {
    console.error('无法读取剪贴板内容:', error)
  }
}
