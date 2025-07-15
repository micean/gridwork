import Mousetrap from 'mousetrap';
import {useSelectedCellsStore} from "@/stores/selectedCells.ts";
import emitter from "@/utils/bus.ts";
import { lookupCellData } from '@/utils/data.ts'


export const registerKeys = () => {
  const selectedCellsStore = useSelectedCellsStore();

  Mousetrap.bind('esc', () => {
    selectedCellsStore.selectParentOrClear();
  });
  Mousetrap.bind('enter', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if(selectedCellsStore.selectedCells.length) {
      selectedCellsStore.startEdit();
    }else{
      selectedCellsStore.addCellOnClick('[0,0]');
    }
  });
  Mousetrap.bind('up', () => {
    selectedCellsStore.focusAnotherCell('up');
  })
  Mousetrap.bind('down', () => {
    selectedCellsStore.focusAnotherCell('down');
  })
  Mousetrap.bind('left', () => {
    selectedCellsStore.focusAnotherCell('left');
  })
  Mousetrap.bind('right', () => {
    selectedCellsStore.focusAnotherCell('right');
  })
  Mousetrap.bind('del', () => {
    selectedCellsStore.selectedCells.forEach(path => {
      emitter.emit('cell-delete', { path });
    })
  })
  Mousetrap.bind('ins', (event) => {
    if(selectedCellsStore.selectedCells.length === 1) {
      event.preventDefault();
      event.stopPropagation();
      const path = selectedCellsStore.selectedCells[0];
      emitter.emit('cell-inner', { path });
    }else if(selectedCellsStore.selectedCells.length > 1){
      event.preventDefault();
      event.stopPropagation();
      const path = selectedCellsStore.selectedCells[0];
      emitter.emit('cell-inner', { path, gridPath: selectedCellsStore.selectedCells });
    }
  })
}

export const wheelEventListener = (event: WheelEvent) => {
  const selectedCellsStore = useSelectedCellsStore();

  if (event.shiftKey && selectedCellsStore.selectedCells.length > 0) {
    event.preventDefault()

    const delta = event.deltaY > 0 ? -1 : 1 // 向下滚动减小，向上滚动增大

    selectedCellsStore.selectedCells.forEach(cellPath => {
      const cell = lookupCellData(selectedCellsStore.gridData, cellPath)
      if (cell) {
        const currentFontSize = cell.fontSize || 13
        const newFontSize = Math.max(13, Math.min(22, currentFontSize + delta))
        cell.fontSize = newFontSize
      }
    })
  }
}
