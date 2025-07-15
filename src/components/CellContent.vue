<script setup lang="ts">
import {computed, ref, useTemplateRef, onMounted, onUnmounted, watch, nextTick} from 'vue'
import type { CellData } from '../../env'
import TableComponent from '@/components/TableComponent.vue'
import { useSelectedCellsStore } from '@/stores/selectedCells.ts'
import {isCursorAtHead, isCursorAtTail, selectionOnTail} from '@/utils/edit.ts'
import { createGridData, pickGridData } from '@/utils/data.ts'
import emitter from '@/utils/bus.ts'

interface Props {
  path: string
}

const model = defineModel<CellData>({ required: true })

const vars = ref({
  content: model.value.text,
})

const props = withDefaults(defineProps<Props>(), {
  path: '',
})
const selectedCellsStore = useSelectedCellsStore()
const cellInput = useTemplateRef('cellInput')

const isCellSelected = computed(() => {
  return selectedCellsStore.isCellSelected(props.path)
})
const isEditing = computed(() => {
  return selectedCellsStore.isEditingCell(props.path)
})

watch(() => model.value.text, (newText) => {
  if(!isEditing.value && newText !== vars.value.content) {
    vars.value.content = newText
    console.log(model.value.text, vars.value.content)
  }
})

const nonTopBorder = computed(() => {
  return (
    selectedCellsStore.isCellSelected(props.path) &&
    !selectedCellsStore.selectedBorder(props.path, 'top')
  )
})
const nonBottomBorder = computed(() => {
  return (
    selectedCellsStore.isCellSelected(props.path) &&
    !selectedCellsStore.selectedBorder(props.path, 'bottom')
  )
})
const nonLeftBorder = computed(() => {
  return (
    selectedCellsStore.isCellSelected(props.path) &&
    !selectedCellsStore.selectedBorder(props.path, 'left')
  )
})
const nonRightBorder = computed(() => {
  return (
    selectedCellsStore.isCellSelected(props.path) &&
    !selectedCellsStore.selectedBorder(props.path, 'right')
  )
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLElement
  model.value.text = target.textContent || ''
}
// const handleEnterInput = (event: Event) => {
// const target = event.target as HTMLElement;
// event.preventDefault();
// vars.value.content = selectionOnEnter(target);
// }

const handleBlur = () => {
  window.getSelection()?.removeAllRanges()
  selectedCellsStore.setEditingCell(null)
  vars.value.content = model.value.text
}

const handleEsc = (event: Event) => {
  const target = event.target as HTMLElement
  if (target === document.activeElement) {
    target.blur()
  }
}

const handleInputArrow = (event: Event, direction: 'up' | 'down' | 'left' | 'right') => {
  const target = event.target as HTMLElement
  switch (direction) {
    case 'up':
      if(isCursorAtHead(target)){
        event.preventDefault()
        event.stopPropagation()
        selectedCellsStore.focusAnotherCell('up', true)
      }
      break
    case 'down':
      if(isCursorAtTail(target)){
        event.preventDefault()
        event.stopPropagation()
        selectedCellsStore.focusAnotherCell('down', true)
      }
      break
    case 'left':
      if(isCursorAtHead(target)){
        event.preventDefault()
        event.stopPropagation()
        selectedCellsStore.focusAnotherCell('left', true)
      }
      break
    case 'right':
      if(isCursorAtTail(target)){
        event.preventDefault()
        event.stopPropagation()
        selectedCellsStore.focusAnotherCell('right', true)
      }
      break
  }
}

const detectMouseEdit = (event: Event) => {
  if (isCellSelected.value) {
    selectedCellsStore.setEditingCell(props.path)
    event.stopPropagation()
    selectedCellsStore.addCellOnClick(props.path)
    selectedCellsStore.setMouseStartCell(props.path)
  }
}

const handleClick = (event: CustomEvent) => {
  if (event.detail.path === props.path) {
    event.preventDefault()
    event.stopPropagation()
    if (!isCellSelected.value) {
      selectedCellsStore.addCellOnClick(props.path)
    } else if (!isEditing.value) {
      selectedCellsStore.setEditingCell(props.path)
      cellInput.value?.focus()
    }
  }
}
const handleCellFocusByKey = (event: { path: string; startEdit?: boolean }) => {
  if (event.path === props.path) {
    if (!isCellSelected.value) {
      selectedCellsStore.addCellOnClick(props.path)
    }
    if (event.startEdit && !isEditing.value) {
      nextTick(() => {
        selectedCellsStore.setEditingCell(props.path)
        if(cellInput.value) selectionOnTail(cellInput.value)
      })
    }
  }
}

const handlePressDelete = (event: { path: string }) => {
  if (event.path === props.path) {
    vars.value.content = ''
    model.value.text = ''
    cellInput.value!.textContent = ''
  }
}
const handlePressInsert = (event: { path: string, gridPath?: string[] }) => {
  if (event.path === props.path) {
    if (!model.value.innerGrid) {
      model.value.innerGrid = event.gridPath ? pickGridData(selectedCellsStore.gridData, event.gridPath) : createGridData(1, 1)
    }
    selectedCellsStore.addCellOnClick(props.path + '>[0,0]')
  }
}

onMounted(() => {
  window.addEventListener('cell-click', handleClick as EventListener)
  emitter.on('cell-focus', handleCellFocusByKey)
  emitter.on('cell-delete', handlePressDelete)
  emitter.on('cell-inner', handlePressInsert)
})

onUnmounted(() => {
  window.removeEventListener('cell-click', handleClick as EventListener)
  emitter.off('cell-focus', handleCellFocusByKey)
  emitter.off('cell-delete', handlePressDelete)
  emitter.off('cell-inner', handlePressInsert)
})

const handleMouse = (event: Event, type: string) => {
  switch (type) {
    case 'mousedown':
      event.stopPropagation()
      event.preventDefault()
      selectedCellsStore.setMouseStartCell(props.path)
      break
    case 'mouseenter':
      selectedCellsStore.setMouseEndCell(props.path)
      break
  }
}
</script>

<template>
  <div
    :id="model.id"
    :class="{
      'cell-content': true,
      focus: isCellSelected,
      'non-top-bd': nonTopBorder,
      'non-bottom-bd': nonBottomBorder,
      'non-left-bd': nonLeftBorder,
      'non-right-bd': nonRightBorder,
    }"
    :style="{
      'background-color': model.backgroundColor,
    }"
    @mousedown="(e) => handleMouse(e, 'mousedown')"
    @mouseenter="(e) => handleMouse(e, 'mouseenter')"
  >
    <code
      ref="cellInput"
      :class="['cell-input', { editing: isEditing }]"
      :contenteditable="isCellSelected"
      :style="{
        'font-size': model.fontSize ? model.fontSize + 'px' : '13px',
      }"
      @input="handleInput"
      @blur="handleBlur"
      @keydown.esc="handleEsc"
      @keydown.up="e => handleInputArrow(e, 'up')"
      @keydown.down="e => handleInputArrow(e, 'down')"
      @keydown.left="e => handleInputArrow(e, 'left')"
      @keydown.right="e => handleInputArrow(e, 'right')"
      @mousedown="detectMouseEdit"
      >{{ vars.content }}</code
    >
    <TableComponent
      v-if="model.innerGrid && model.innerGrid.length > 0"
      v-model="model.innerGrid"
      :parentPath="path"
    />
  </div>
</template>

<style scoped lang="scss" src="./CellContent.scss" />
