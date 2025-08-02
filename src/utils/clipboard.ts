import { useDocumentStore } from '@/stores/document.ts'
import {
  copyCellData,
  createCellData,
  createRowData,
  lookupCellData,
  lookupInnerGrid, nanoid, parseGrid,
  pickGridData, stringifyCell,
  tablizeGrid
} from '@/utils/data.ts'
import type { CellData } from '../../env'
import {useModeStore} from "@/stores/mode.ts";

/**
 * 获取选中单元格的剪贴板数据
 */
const getClipboardData = () => {
  const documentStore = useDocumentStore()

  // 获取选中的单元格数据
  const selectedCells = pickGridData(documentStore.gridData, documentStore.selectedCells, false);

  // 生成纯文本格式（制表符分隔）
  const plainText = documentStore.selectedCells.length === 1 ?
    stringifyCell(lookupCellData(documentStore.gridData, documentStore.selectedCells[0])!) :
    selectedCells.map(row => row.map(cell => stringifyCell(cell, true)).join('\t')).join('\n')

  // 生成HTML表格格式
  const htmlText = tablizeGrid(selectedCells);

  return { plainText, htmlText }
}

/**
 * 将数据写入剪贴板
 */
const writeToClipboard = async (event: ClipboardEvent, plainText: string, htmlText: string) => {
  try {
    if (event.clipboardData) {
      event.clipboardData.setData('text/plain', plainText)
      event.clipboardData.setData('text/html', htmlText)
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(plainText)
    }
    return true
  } catch (error) {
    console.error('failed to write to clipboard:', error)
    return false
  }
}

export const pasteEventListener = async (event: ClipboardEvent) => {
  const documentStore = useDocumentStore()
  const modeStore = useModeStore()
  // 如果有单元格正在编辑，不处理粘贴事件
  if (modeStore.readonly || documentStore.editingCell || !documentStore.selectedCells.length) {
    return
  }

  // 阻止默认粘贴行为
  event.preventDefault()

  try {
    const clipboardText: {
      original: string
      isGrid: boolean
      gridData: CellData[][]
    } = {
      original: '',
      isGrid: false,
      gridData: [],
    }

    // 尝试多种方式获取剪贴板内容
    if (event.clipboardData) {
      // 使用事件对象的clipboardData（更可靠）
      clipboardText.original = event.clipboardData.getData('text/plain')

      const htmlText = event.clipboardData.getData('text/html')
      if(htmlText){
        // 检测是否是表格，如果是，获取表格数据放在gridText中，并设置isGrid为true
        const grid = parseGrid(htmlText)
        if(grid){
          clipboardText.gridData = grid
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
        clipboardText.gridData = text.replace(/\r/g, '')
          .split('\n')
          .map(row => row.split('\t').map(text => {
            return {
              id: nanoid(),
              text,
            }
          }))
        clipboardText.isGrid = true
      }
    }

    if (clipboardText && documentStore.selectedCells.length > 0) {
      // 将剪贴板内容填入所有选定的单元格
      if(!clipboardText.isGrid){
        console.log(clipboardText.gridData)
        documentStore.selectedCells.map(it =>
          lookupCellData(documentStore.gridData, it)!
        ).forEach(cell => {
            cell.text = clipboardText.original
        })
      } else {
        // 将gridText填入选定的单元格
        const selectedCells = documentStore.selectedCells

        const startCell = selectedCells[0]
        const startCellParts = startCell.split('>').map(it => JSON.parse(it) as [number, number])
        const [startRow, startCol] = startCellParts.pop()!
        const parentGrid: CellData[][] = lookupInnerGrid(documentStore.gridData, startCellParts)
        if (selectedCells.length === 1) {
          // 单个单元格：以该单元格为起点填充表格数据
          clipboardText.gridData.forEach((rowData, rowIndex) => {
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
              const cell = lookupCellData(documentStore.gridData, cellPath)
              if (cell) {
                copyCellData(cellData, cell)
              }
            })
          })
        } else {
          // 多个单元格
          if(clipboardText.gridData.length === 1 && clipboardText.gridData[0].length === 1){
            // 如果gridText只有一个单元格，那么将其复制到所有选定的单元格
            const cellData = clipboardText.gridData[0][0]
            selectedCells.map(cellPath => lookupCellData(documentStore.gridData, cellPath)).filter(Boolean).forEach(cell => {
              copyCellData(cellData, cell!)
            })
          }else{
            // 如果gridText有多个单元格，那么将gridText中的单元格复制到所有选定的单元格
            clipboardText.gridData.forEach((rowData, rowIndex) => {
              const targetRow = startRow + rowIndex
              rowData.forEach((cellData, colIndex) => {
                const targetCol = startCol + colIndex
                const cellPath = startCellParts.concat([[targetRow, targetCol]]).map(it => JSON.stringify(it)).join('>')
                if(!selectedCells.includes(cellPath)){
                  return
                }
                const cell = lookupCellData(documentStore.gridData, cellPath)
                if (cell) {
                  cellData.id = nanoid()
                  copyCellData(cellData, cell)
                }
              })
            })
          }
        }
      }

    }
  } catch (error) {
    console.error('failed to read from clipboard:', error)
  }
}

export const copyEventListener = async (event: ClipboardEvent) => {
  const documentStore = useDocumentStore()

  // 如果有单元格正在编辑，不处理复制事件
  if (documentStore.editingCell || !documentStore.selectedCells.length) {
    return
  }

  // 阻止默认复制行为
  event.preventDefault()

  const { plainText, htmlText } = getClipboardData()
  await writeToClipboard(event, plainText, htmlText)
}

export const cutEventListener = async (event: ClipboardEvent) => {
  const documentStore = useDocumentStore()

  // 如果有单元格正在编辑，不处理剪切事件
  if (documentStore.editingCell || !documentStore.selectedCells.length) {
    return
  }

  // 阻止默认剪切行为
  event.preventDefault()

  const { plainText, htmlText } = getClipboardData()
  const success = await writeToClipboard(event, plainText, htmlText)

  if (success) {
    // 清空选中的单元格内容（剪切操作）
    documentStore.selectedCells.forEach(cellPath => {
      const cell = lookupCellData(documentStore.gridData, cellPath)
      if (cell) {
        cell.text = ''
        cell.innerGrid = undefined
      }
    })
  }
}
