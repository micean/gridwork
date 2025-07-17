import Mousetrap from 'mousetrap';
import {useDocumentStore} from "@/stores/document.ts";
import {useHistoryStore} from "@/stores/history.ts";
import emitter from "@/utils/bus.ts";
import {lookupCellData} from '@/utils/data.ts'
import { getDBManager } from '@/utils/db.ts'


export const registerKeys = () => {
  const documentStore = useDocumentStore();
  const historyStore = useHistoryStore();

  Mousetrap.bind('esc', () => {
    documentStore.selectParentOrClear();
  });
  Mousetrap.bind('enter', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if(documentStore.selectedCells.length) {
      documentStore.startEdit();
    }else{
      documentStore.addCellOnClick('[0,0]');
    }
  });
  Mousetrap.bind('up', () => {
    documentStore.focusAnotherCell('up');
  })
  Mousetrap.bind('down', () => {
    documentStore.focusAnotherCell('down');
  })
  Mousetrap.bind('left', () => {
    documentStore.focusAnotherCell('left');
  })
  Mousetrap.bind('right', () => {
    documentStore.focusAnotherCell('right');
  })
  Mousetrap.bind(['del', 'backspace'], () => {
    documentStore.selectedCells.forEach(path => {
      emitter.emit('cell-delete', { path });
    })
  })
  Mousetrap.bind('ins', (event) => {
    if(!documentStore.selectedCells.length) return
    event.preventDefault();
    event.stopPropagation();

    if(documentStore.selectedCells.length === 1) {
      const path = documentStore.selectedCells[0];
      emitter.emit('cell-inner', { path });
    }else if(documentStore.selectedCells.length > 1){
      const path = documentStore.selectedCells[0];
      emitter.emit('cell-inner', { path, gridPath: documentStore.selectedCells });
    }
  })

  // Undo/Redo shortcuts
  Mousetrap.bind(['ctrl+z', 'command+z'], (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (historyStore.canUndo) {
      const previousData = historyStore.undo();
      if (previousData) {
        documentStore.setupGrid(JSON.parse(previousData.gridData));
        documentStore.setSelectedCells(previousData.selectedCells || []);
      }
    }
  });

  Mousetrap.bind(['ctrl+y', 'command+y', 'ctrl+shift+z', 'command+shift+z'], (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (historyStore.canRedo) {
      const nextData = historyStore.redo();
      if (nextData) {
        documentStore.setupGrid(JSON.parse(nextData.gridData));
        documentStore.setSelectedCells(nextData.selectedCells || []);
      }
    }
  });

  Mousetrap.bind('ctrl+a', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if(!documentStore.selectedCells.length || !documentStore.selectedCells[0].includes('>')){
      const cells = documentStore.gridData.flatMap((row, rowIdx) => row.map((cell, colIdx) => `[${rowIdx},${colIdx}]`));
      documentStore.setSelectedCells(cells);
    }else{
      const parentPath = documentStore.selectedCells[0].substring(0, documentStore.selectedCells[0].indexOf('>'));
      const gridData = lookupCellData(documentStore.gridData, parentPath);
      const cells = gridData?.innerGrid?.flatMap((row, rowIdx) => row.map((cell, colIdx) => `${parentPath}>[${rowIdx},${colIdx}]`));
      documentStore.setSelectedCells(cells || []);
    }
  })

  Mousetrap.bind('ctrl+s', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const dbManager = getDBManager();
    documentStore.saveDocument(dbManager);
  })
}

export const wheelEventListener = (event: WheelEvent) => {
  const documentStore = useDocumentStore();

  if (event.shiftKey && documentStore.selectedCells.length > 0) {
    event.preventDefault()

    const delta = event.deltaY > 0 ? -1 : 1 // 向下滚动减小，向上滚动增大

    documentStore.selectedCells.forEach(cellPath => {
      const cell = lookupCellData(documentStore.gridData, cellPath)
      if (cell) {
        const currentFontSize = cell.fontSize || 13
        const newFontSize = Math.max(13, Math.min(22, currentFontSize + delta))
        cell.fontSize = newFontSize
      }
    })
  }
}
