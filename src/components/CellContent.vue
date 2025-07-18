<script setup lang="ts">
import { computed, ref, useTemplateRef, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { CellData } from '../../env'
import TableComponent from '@/components/TableComponent.vue'
import { useDocumentStore } from '@/stores/document.ts'
import { isCursorAtHead, isCursorAtTail, selectionOnTail } from '@/utils/edit.ts'
import { createGridData, pickGridData } from '@/utils/data.ts'
import emitter from '@/utils/bus.ts'
import { useSearchStore } from '@/stores/search.ts'

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
const documentStore = useDocumentStore()
const searchStore = useSearchStore()
const cellInput = useTemplateRef('cellInput')

const isCellSelected = computed(() => {
  return documentStore.isCellSelected(props.path)
})
const isEditing = computed(() => {
  return documentStore.isEditingCell(props.path)
})

watch(
  () => model.value.text,
  (newText) => {
    if (!isEditing.value && newText !== vars.value.content) {
      vars.value.content = newText
      console.log(model.value.text, vars.value.content)
    }
  },
)

const sizeNumber = computed(() => {
  const fontSize = model.value.fontSize || 0.8;
  return 2 + (fontSize - 0.4) * 37.5
})
const nonTopBorder = computed(() => {
  return (
    documentStore.isCellSelected(props.path) && !documentStore.selectedBorder(props.path, 'top')
  )
})
const nonBottomBorder = computed(() => {
  return (
    documentStore.isCellSelected(props.path) && !documentStore.selectedBorder(props.path, 'bottom')
  )
})
const nonLeftBorder = computed(() => {
  return (
    documentStore.isCellSelected(props.path) && !documentStore.selectedBorder(props.path, 'left')
  )
})
const nonRightBorder = computed(() => {
  return (
    documentStore.isCellSelected(props.path) && !documentStore.selectedBorder(props.path, 'right')
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
  documentStore.setEditingCell(null)
  vars.value.content = model.value.text
  window.dispatchEvent(new CustomEvent('editor-blur', { detail: { path: props.path } }))
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
      if (isCursorAtHead(target)) {
        event.preventDefault()
        event.stopPropagation()
        documentStore.focusAnotherCell('up', true)
      }
      break
    case 'down':
      if (isCursorAtTail(target)) {
        event.preventDefault()
        event.stopPropagation()
        documentStore.focusAnotherCell('down', true)
      }
      break
    case 'left':
      if (isCursorAtHead(target)) {
        event.preventDefault()
        event.stopPropagation()
        documentStore.focusAnotherCell('left', true)
      }
      break
    case 'right':
      if (isCursorAtTail(target)) {
        event.preventDefault()
        event.stopPropagation()
        documentStore.focusAnotherCell('right', true)
      }
      break
  }
}

const detectMouseEdit = (event: Event) => {
  if (isCellSelected.value) {
    documentStore.setEditingCell(props.path)
    event.stopPropagation()
    documentStore.addCellOnClick(props.path)
    documentStore.setMouseStartCell(props.path)
  }
}

const handleClick = (event: CustomEvent) => {
  if (event.detail.path === props.path) {
    event.preventDefault()
    event.stopPropagation()
    if (!isCellSelected.value) {
      documentStore.addCellOnClick(props.path)
    } else if (!isEditing.value) {
      documentStore.setEditingCell(props.path)
      cellInput.value?.focus()
    }
  }
}
const handleCellFocusByKey = (event: { path: string; startEdit?: boolean }) => {
  if (event.path === props.path) {
    if (!isCellSelected.value) {
      documentStore.addCellOnClick(props.path)
    }
    if (event.startEdit && !isEditing.value) {
      nextTick(() => {
        documentStore.setEditingCell(props.path)
        if (cellInput.value) selectionOnTail(cellInput.value)
      })
    }
  }
}

const handlePressDelete = (event: { path: string }) => {
  if (event.path === props.path) {
    model.value.text = ''
    model.value.innerGrid = undefined
    cellInput.value!.textContent = ''
  }
}
const handlePressInsert = (event: { path: string; gridPath?: string[] }) => {
  if (event.path === props.path) {
    if (!model.value.innerGrid) {
      model.value.innerGrid = event.gridPath
        ? pickGridData(documentStore.gridData, event.gridPath)
        : createGridData(1, 1)
    }
    documentStore.addCellOnClick(props.path + '>[0,0]')
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
      documentStore.setMouseStartCell(props.path)
      break
    case 'mouseenter':
      documentStore.setMouseEndCell(props.path)
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
      'background-color':
        searchStore.isSearchVisible && searchStore.highlight(model.text || '') || isEditing
          ? 'white'
          : model.backgroundColor,
      'flex-direction': model.flexDirection,
      'align-items': model.flexDirection === 'row' ? 'center' : undefined,
    }"
    @mousedown="(e) => handleMouse(e, 'mousedown')"
    @mouseenter="(e) => handleMouse(e, 'mouseenter')"
  >
    <code
      ref="cellInput"
      v-show="sizeNumber > 2"
      :class="['cell-input', { editing: isEditing }]"
      :contenteditable="isCellSelected"
      :style="{
        'font-size': model.fontSize ? model.fontSize + 'rem' : '0.8rem',
        'font-style': model.fontItalic ? 'italic' : undefined,
        'text-decoration': [model.fontThrough ? 'line-through' : undefined, model.fontUnderline ? 'underline' : undefined].filter(Boolean).join(' ').trim() || undefined,
        'min-width': sizeNumber + 'px',
        'min-height': sizeNumber + 'px',
        color:
          searchStore.isSearchVisible && searchStore.highlight(model.text || '')
            ? 'red'
            : undefined,
        'max-width': model.flexDirection === 'row' && model.innerGrid ? '600px' : undefined,
        display: model.flexDirection === 'row' && model.innerGrid ? 'flex' : undefined,
        'align-items': model.flexDirection === 'row' && model.innerGrid ? 'center' : undefined,
      }"
      @input="handleInput"
      @blur="handleBlur"
      @keydown.esc="handleEsc"
      @keydown.up="(e) => handleInputArrow(e, 'up')"
      @keydown.down="(e) => handleInputArrow(e, 'down')"
      @keydown.left="(e) => handleInputArrow(e, 'left')"
      @keydown.right="(e) => handleInputArrow(e, 'right')"
      @mousedown="detectMouseEdit"
      >{{ vars.content }}</code
    >
    <div
      v-if="
        searchStore.isSearchVisible &&
        searchStore.searchQuery.length &&
        !searchStore.highlight(model.text || '')
      "
      class="masked"
    ></div>
    <TableComponent
      v-if="model.innerGrid && model.innerGrid.length > 0"
      v-show="sizeNumber > 2"
      v-model="model.innerGrid"
      :parentPath="path"
    />
  </div>
</template>

<style scoped lang="scss" src="./CellContent.scss" />
