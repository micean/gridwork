<script setup lang="ts">
import { computed, ref, useTemplateRef, onMounted, onUnmounted } from 'vue'
import type { CellData } from '../../env'
import TableComponent from '@/components/TableComponent.vue'
import { useSelectedCellsStore } from '@/stores/selectedCells.ts'
import { selectionOnTail } from '@/utils/edit.ts'
import { createGridData } from '@/utils/data.ts'
import emitter from '@/utils/bus.ts'

interface Props {
  path: string
}

const model = defineModel<CellData>({ required: true })

const vars = ref({
  editing: false,
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
  vars.value.editing = false
}

const handleEsc = (event: Event) => {
  const target = event.target as HTMLElement
  if (target === document.activeElement) {
    target.blur()
  }
}

const detectMouseEdit = (event: Event) => {
  if (isCellSelected.value) {
    vars.value.editing = true
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
    } else if (!vars.value.editing) {
      vars.value.editing = true
      cellInput.value?.focus()
    }
  }
}
const handleCellFocusByKey = (event: { path: string; startEdit?: boolean }) => {
  if (event.path === props.path) {
    if (!isCellSelected.value) {
      selectedCellsStore.addCellOnClick(props.path)
    } else if (!vars.value.editing) {
      vars.value.editing = true
      event.startEdit && cellInput.value && selectionOnTail(cellInput.value)
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
const handlePressInsert = (event: { path: string }) => {
  if (event.path === props.path) {
    if (!model.value.innerGrid) {
      model.value.innerGrid = createGridData(1, 1)
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
    @mousedown="(e) => handleMouse(e, 'mousedown')"
    @mouseenter="(e) => handleMouse(e, 'mouseenter')"
  >
    <code
      ref="cellInput"
      :class="['cell-input', { editing: vars.editing }]"
      :contenteditable="isCellSelected"
      :style="{ 'font-size': model.fontSize ? model.fontSize + 'px' : '13px' }"
      @input="handleInput"
      @blur="handleBlur"
      @keydown.esc="handleEsc"
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
