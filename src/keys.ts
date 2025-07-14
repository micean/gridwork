import Mousetrap from 'mousetrap';
import {useSelectedCellsStore} from "@/stores/selectedCells.ts";
import emitter from "@/utils/bus.ts";
import {lookupCellData} from "@/utils/data.ts";


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
  Mousetrap.bind('ins', () => {
    selectedCellsStore.selectedCells.forEach(path => {
      emitter.emit('cell-inner', { path });
    })
  })
}
