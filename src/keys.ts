import Mousetrap from 'mousetrap'
import { useDocumentStore } from '@/stores/document.ts'
import { useHistoryStore } from '@/stores/history.ts'
import emitter from '@/utils/bus.ts'
import { lookupCellData, changeGridFontSize } from '@/utils/data.ts'
import { getDBManager } from '@/utils/db.ts'
import type {Store} from "pinia";
import type { CellData } from '../env'
import {useModeStore} from "@/stores/mode.ts";

export const registerKeys = () => {
  const documentStore = useDocumentStore()
  const historyStore = useHistoryStore()
  const modeStore = useModeStore()

  Mousetrap.bind('esc', () => {
    if(documentStore.isZoomed() && documentStore.selectedCells.length && documentStore.selectedCells[0].split('>').length === 2) {
      documentStore.exitZoom();
      return
    }
    documentStore.selectParentOrClear()
  })
  Mousetrap.bind('enter', (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (documentStore.selectedCells.length) {
      documentStore.startEdit()
    } else {
      documentStore.addCellOnClick('[0,0]')
    }
  })
  Mousetrap.bind('up', () => {
    documentStore.focusAnotherCell('up')
  })
  Mousetrap.bind('down', () => {
    documentStore.focusAnotherCell('down')
  })
  Mousetrap.bind('left', () => {
    documentStore.focusAnotherCell('left')
  })
  Mousetrap.bind('right', () => {
    documentStore.focusAnotherCell('right')
  })
  
  // Shift+方向键选择范围
  Mousetrap.bind('shift+up', () => {
    documentStore.handleShiftArrow('up')
  })
  Mousetrap.bind('shift+down', () => {
    documentStore.handleShiftArrow('down')
  })
  Mousetrap.bind('shift+left', () => {
    documentStore.handleShiftArrow('left')
  })
  Mousetrap.bind('shift+right', () => {
    documentStore.handleShiftArrow('right')
  })
  Mousetrap.bind(['del', 'backspace'], () => {
    if(modeStore.readonly) return
    documentStore.selectedCells.forEach((path) => {
      emitter.emit('cell-delete', { path })
    })
  })
  Mousetrap.bind('ins', (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (!documentStore.selectedCells.length) return
    if(modeStore.readonly) return

    if (documentStore.selectedCells.length === 1) {
      const path = documentStore.selectedCells[0]
      emitter.emit('cell-inner', { path })
    } else if (documentStore.selectedCells.length > 1) {
      const path = documentStore.selectedCells[0]
      emitter.emit('cell-inner', { path, gridPath: documentStore.selectedCells })
    }
  })

  // Undo/Redo shortcuts
  Mousetrap.bind(['ctrl+z', 'command+z'], (event) => {
    event.preventDefault()
    event.stopPropagation()
    if(modeStore.readonly) return
    if (historyStore.canUndo) {
      const previousData = historyStore.undo()
      if (previousData) {
        documentStore.setupGrid(JSON.parse(previousData.gridData))
        documentStore.setSelectedCells(previousData.selectedCells || [])
      }
    }
  })

  Mousetrap.bind(['ctrl+y', 'command+y', 'ctrl+shift+z', 'command+shift+z'], (event) => {
    event.preventDefault()
    event.stopPropagation()
    if(modeStore.readonly) return
    if (historyStore.canRedo) {
      const nextData = historyStore.redo()
      if (nextData) {
        documentStore.setupGrid(JSON.parse(nextData.gridData))
        documentStore.setSelectedCells(nextData.selectedCells || [])
      }
    }
  })

  Mousetrap.bind('ctrl+a', (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (!documentStore.selectedCells.length || !documentStore.selectedCells[0].includes('>')) {
      const cells = documentStore.gridData.flatMap((row, rowIdx) =>
        row.map((cell, colIdx) => `[${rowIdx},${colIdx}]`),
      )
      documentStore.setSelectedCells(cells)
    } else {
      const parentPath = documentStore.selectedCells[0].substring(
        0,
        documentStore.selectedCells[0].lastIndexOf('>'),
      )
      const gridData = lookupCellData(documentStore.gridData, parentPath)
      const cells = gridData?.innerGrid?.flatMap((row, rowIdx) =>
        row.map((cell, colIdx) => `${parentPath}>[${rowIdx},${colIdx}]`),
      )
      documentStore.setSelectedCells(cells || [])
    }
  })

  Mousetrap.bind('ctrl+s', (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (modeStore.readonly || documentStore.isZoomed()) return;
    const dbManager = getDBManager()
    documentStore.saveDocument(dbManager)
  })
}

export const wheelEventListener = (event: WheelEvent) => {
  const documentStore = useDocumentStore()
  const modeStore = useModeStore()
  if (event.ctrlKey) {
    if (event.deltaY < 0) {
      // 滚轮前滚 - 放大
      documentStore.zoomIn()
    } else {
      // 滚轮后滚 - 缩小
      documentStore.zoomOut()
    }
  } else if (event.shiftKey && !modeStore.readonly && documentStore.selectedCells.length > 0) {
    // Shift+滚轮调整字体大小
    event.preventDefault() // 阻止默认的滚动行为
    event.stopPropagation() // 阻止事件冒泡

    const delta = event.deltaY > 0 ? -0.1 : 0.1 // 向下滚动减小，向上滚动增大
    changeFontSize(documentStore, delta)
    return false
  }
}

function changeFontSize(documentStore: { selectedCells: string[], gridData: CellData[][] }, delta: number) {
  documentStore.selectedCells.forEach((cellPath: string) => {
    const cell = lookupCellData(documentStore.gridData, cellPath)
    if (cell) {
      changeGridFontSize(cell, delta)
    }
  })
}

// 阻止浏览器的Ctrl+滚轮缩放
export const preventBrowserZoom = () => {
  const handleWheel = (event: WheelEvent) => {
    if (event.ctrlKey) {
      event.preventDefault()
    }
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (
      (event.ctrlKey || event.metaKey) &&
      (event.key === '+' || event.key === '-' || event.key === '=')
    ) {
      event.preventDefault()
    }
  }

  // 添加被动监听器
  document.addEventListener('wheel', handleWheel, { passive: false })
  document.addEventListener('keydown', handleKeydown, { passive: false })

  // 返回清理函数
  return () => {
    document.removeEventListener('wheel', handleWheel)
    document.removeEventListener('keydown', handleKeydown)
  }
}
