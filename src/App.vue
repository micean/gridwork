<script setup lang="ts">
import TableComponent from './components/TableComponent.vue'
import Slider from './components/Slider.vue'
import ColorPicker from './components/ColorPicker.vue'
import {
  createCellData,
  createGridData,
  createRowData,
  lookupCellData,
  lookupInnerGrid,
} from '@/utils/data.ts'
import { ref, onMounted, onUnmounted } from 'vue'
import { useSelectedCellsStore } from '@/stores/selectedCells.ts'
import type { CellData } from '../env'
import { pasteEventListener, copyEventListener } from '@/utils/clipboard.ts'
import { wheelEventListener } from '@/keys.ts'

const gridData = createGridData(4, 4)
const vars = ref({
  showFontSizePopup: false,
  fontSize: 13,
  showColorPopup: false,
})
const selectedCellsStore = useSelectedCellsStore()
selectedCellsStore.setupGrid(gridData)

const addRowCol = (edge: 'top' | 'bottom' | 'left' | 'right') => {
  if (selectedCellsStore.selectedCells.length !== 1) return

  let originCellPath = selectedCellsStore.selectedCells[0]
  const parts = originCellPath.split('>').map((it) => JSON.parse(it))
  const [row, col] = parts.pop()
  const parentGrid: CellData[][] = lookupInnerGrid(selectedCellsStore.gridData, parts)

  switch (edge) {
    case 'top':
      parentGrid.splice(row, 0, createRowData(parentGrid[0].length))
      originCellPath = parts.length
        ? `${parts.join('>')}>[${row + 1},${col}]`
        : `[${row + 1},${col}]`
      break
    case 'bottom':
      parentGrid.splice(row + 1, 0, createRowData(parentGrid[0].length))
      break
    case 'left':
      parentGrid.forEach((eachRow) => {
        eachRow.splice(col, 0, createCellData())
      })
      originCellPath = parts.length
        ? `${parts.join('>')}>[${row},${col + 1}]`
        : `[${row},${col + 1}]`
      break
    case 'right':
      parentGrid.forEach((eachRow) => {
        eachRow.splice(col + 1, 0, createCellData())
      })
      break
  }
  selectedCellsStore.addCellOnClick(originCellPath)
}

const removeRowCol = (type: 'row' | 'col') => {
  if (!selectedCellsStore.selectedCells.length) return

  const posArr = selectedCellsStore.selectedCells.map((path) => {
    const parts: [number, number][] = path.split('>').map((it) => JSON.parse(it))
    const pos: [number, number] = parts.pop()!
    return { parts, pos }
  })
  const parentGrid: CellData[][] = lookupInnerGrid(selectedCellsStore.gridData, posArr[0].parts)

  switch (type) {
    case 'row':
      posArr
        .map((it) => it.pos[0])
        .filter((e, i, self) => i === self.indexOf(e))
        .sort()
        .forEach((row, index) => {
          parentGrid.splice(row - index, 1)
        })
      if (parentGrid.length === 0) {
        parentGrid.push(createRowData(1))
      }
      break
    case 'col':
      posArr
        .map((it) => it.pos[1])
        .filter((e, i, self) => i === self.indexOf(e))
        .sort()
        .forEach((col, index) => {
          parentGrid.forEach((row) => row.splice(col - index, 1))
        })
      if (parentGrid[0]?.length === 0) {
        parentGrid.splice(0, parentGrid.length)
        parentGrid.push(createRowData(1))
      }
      break
  }

  // 清除选中状态，因为删除后原位置可能不存在
  selectedCellsStore.clearSelection()
}

const toggleFontSizePopup = () => {
  if (selectedCellsStore.selectedCells.length) {
    const firstCell = lookupCellData(
      selectedCellsStore.gridData,
      selectedCellsStore.selectedCells[0],
    )
    vars.value.fontSize = firstCell?.fontSize || 13
    vars.value.showFontSizePopup = !vars.value.showFontSizePopup
  }
}

const handleFontSizeChange = () => {
  if (!selectedCellsStore.selectedCells.length) return
  selectedCellsStore.selectedCells
    .map((it) => lookupCellData(selectedCellsStore.gridData, it)!)
    .forEach((cell) => {
      cell.fontSize = vars.value.fontSize
    })
}

const toggleColorPopup = () => {
  if (selectedCellsStore.selectedCells.length) {
    vars.value.showColorPopup = !vars.value.showColorPopup
  }
}

const handleColorSelect = (color: string) => {
  if (!selectedCellsStore.selectedCells.length) return

  selectedCellsStore.selectedCells
    .map((it) => lookupCellData(selectedCellsStore.gridData, it)!)
    .forEach((cell) => {
        cell.backgroundColor = color
    })

  // 选择颜色后关闭弹窗
  vars.value.showColorPopup = false
}

// 添加和移除事件监听
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.color-popup') && !target.closest('[title="颜色"]')) {
    vars.value.showColorPopup = false
  }
  if (!target.closest('.font-size-popup') && !target.closest('[title="字体大小"]')) {
    vars.value.showFontSizePopup = false
  }
}

onMounted(() => {
  document.addEventListener('paste', pasteEventListener)
  document.addEventListener('copy', copyEventListener)
  document.addEventListener('wheel', wheelEventListener)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('paste', pasteEventListener)
  document.removeEventListener('copy', copyEventListener)
  document.removeEventListener('wheel', wheelEventListener)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <div class="toolbar">
        <i
          title="向上增加一行"
          @click="addRowCol('top')"
          :class="{ disabled: selectedCellsStore.selectedCells.length !== 1 }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="currentColor"
          >
            <path
              d="M12 13C14.7614 13 17 15.2386 17 18C17 20.7614 14.7614 23 12 23C9.23858 23 7 20.7614 7 18C7 15.2386 9.23858 13 12 13ZM13 15H11V16.999L9 17V19L11 18.999V21H13V18.999L15 19V17L13 16.999V15ZM20 3C20.5523 3 21 3.44772 21 4V10C21 10.5523 20.5523 11 20 11H4C3.44772 11 3 10.5523 3 10V4C3 3.44772 3.44772 3 4 3H20ZM5 5V9H19V5H5Z"
            ></path>
          </svg>
        </i>
        <i
          title="向下增加一行"
          @click="addRowCol('bottom')"
          :class="{ disabled: selectedCellsStore.selectedCells.length !== 1 }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="currentColor"
          >
            <path
              d="M20 13C20.5523 13 21 13.4477 21 14V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V14C3 13.4477 3.44772 13 4 13H20ZM19 15H5V19H19V15ZM12 1C14.7614 1 17 3.23858 17 6C17 8.76142 14.7614 11 12 11C9.23858 11 7 8.76142 7 6C7 3.23858 9.23858 1 12 1ZM13 3H11V4.999L9 5V7L11 6.999V9H13V6.999L15 7V5L13 4.999V3Z"
            ></path>
          </svg>
        </i>
        <i
          title="向左增加一列"
          @click="addRowCol('left')"
          :class="{ disabled: selectedCellsStore.selectedCells.length !== 1 }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="currentColor"
          >
            <path
              d="M20 3C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H14C13.4477 21 13 20.5523 13 20V4C13 3.44772 13.4477 3 14 3H20ZM19 5H15V19H19V5ZM6 7C8.76142 7 11 9.23858 11 12C11 14.7614 8.76142 17 6 17C3.23858 17 1 14.7614 1 12C1 9.23858 3.23858 7 6 7ZM7 9H5V10.999L3 11V13L5 12.999V15H7V12.999L9 13V11L7 10.999V9Z"
            ></path>
          </svg>
        </i>
        <i
          title="向右增加一列"
          @click="addRowCol('right')"
          :class="{ disabled: selectedCellsStore.selectedCells.length !== 1 }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="currentColor"
          >
            <path
              d="M10 3C10.5523 3 11 3.44772 11 4V20C11 20.5523 10.5523 21 10 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3H10ZM9 5H5V19H9V5ZM18 7C20.7614 7 23 9.23858 23 12C23 14.7614 20.7614 17 18 17C15.2386 17 13 14.7614 13 12C13 9.23858 15.2386 7 18 7ZM19 9H17V10.999L15 11V13L17 12.999V15H19V12.999L21 13V11L19 10.999V9Z"
            ></path>
          </svg>
        </i>
        <i
          title="删除行"
          @click="removeRowCol('row')"
          :class="{ disabled: !selectedCellsStore.selectedCells.length }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="currentColor"
          >
            <path
              d="M20 5C20.5523 5 21 5.44772 21 6V12C21 12.5523 20.5523 13 20 13C20.628 13.8355 21 14.8743 21 16C21 18.7614 18.7614 21 16 21C13.2386 21 11 18.7614 11 16C11 14.8743 11.372 13.8355 11.9998 12.9998L4 13C3.44772 13 3 12.5523 3 12V6C3 5.44772 3.44772 5 4 5H20ZM13 15V17H19V15H13ZM19 7H5V11H19V7Z"
            ></path>
          </svg>
        </i>
        <i
          title="删除列"
          @click="removeRowCol('col')"
          :class="{ disabled: !selectedCellsStore.selectedCells.length }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="currentColor"
          >
            <path
              d="M12 3C12.5523 3 13 3.44772 13 4L12.9998 11.9998C13.8355 11.372 14.8743 11 16 11C18.7614 11 21 13.2386 21 16C21 18.7614 18.7614 21 16 21C14.9681 21 14.0092 20.6874 13.2129 20.1518L13 20C13 20.5523 12.5523 21 12 21H6C5.44772 21 5 20.5523 5 20V4C5 3.44772 5.44772 3 6 3H12ZM11 5H7V19H11V5ZM19 15H13V17H19V15Z"
            ></path>
          </svg>
        </i>
        <i
          title="字体大小"
          @click="toggleFontSizePopup"
          :class="{ disabled: !selectedCellsStore.selectedCells.length }"
          style="position: relative"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="currentColor"
          >
            <path
              d="M11.246 15H4.75416L2.75416 20H0.600098L7.0001 4H9.0001L15.4001 20H13.246L11.246 15ZM10.446 13L8.0001 6.88516L5.55416 13H10.446ZM21.0001 12.5351V12H23.0001V20H21.0001V19.4649C20.4118 19.8052 19.7287 20 19.0001 20C16.791 20 15.0001 18.2091 15.0001 16C15.0001 13.7909 16.791 12 19.0001 12C19.7287 12 20.4118 12.1948 21.0001 12.5351ZM19.0001 18C20.1047 18 21.0001 17.1046 21.0001 16C21.0001 14.8954 20.1047 14 19.0001 14C17.8955 14 17.0001 14.8954 17.0001 16C17.0001 17.1046 17.8955 18 19.0001 18Z"
            ></path>
          </svg>

          <!-- 字体大小弹出层 -->
          <div
            v-if="vars.showFontSizePopup"
            class="font-size-popup"
            @click="(e) => e.stopPropagation()"
          >
            <div class="popup-content">
              <div class="popup-body">
                <Slider
                  v-model="vars.fontSize"
                  :min="13"
                  :max="22"
                  :step="1"
                  :show-labels="true"
                  :show-tooltip="true"
                  :format="(value) => `${value}px`"
                  @change="handleFontSizeChange"
                />
              </div>
            </div>
          </div>
        </i>
        <i
          title="颜色"
          @click="toggleColorPopup"
          :class="{ disabled: !selectedCellsStore.selectedCells.length }"
          style="position: relative"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="currentColor"
          >
            <path
              d="M16.5357 15.9465L18.657 13.8252L15.475 10.6432L19.0106 7.10768L16.8892 4.98636L13.3537 8.52189L10.1717 5.33991L8.05041 7.46123L16.5357 15.9465ZM15.1215 17.3607L6.6362 8.87544L3.80777 11.7039L12.293 20.1892L15.1215 17.3607ZM13.3537 5.69346L16.1821 2.86504C16.5727 2.47451 17.2058 2.47451 17.5963 2.86504L21.1319 6.40057C21.5224 6.79109 21.5224 7.42426 21.1319 7.81478L18.3035 10.6432L20.7783 13.1181C21.1689 13.5086 21.1689 14.1418 20.7783 14.5323L13.0002 22.3105C12.6096 22.701 11.9765 22.701 11.5859 22.3105L1.68645 12.411C1.29592 12.0205 1.29592 11.3873 1.68645 10.9968L9.46462 3.21859C9.85515 2.82807 10.4883 2.82807 10.8788 3.21859L13.3537 5.69346Z"
            ></path>
          </svg>

          <ColorPicker
            v-model="vars.showColorPopup"
            @select-color="handleColorSelect"
          />
        </i>
      </div>
    </header>
    <main class="editor-area">
      <div class="editor-content">
        <TableComponent v-model="selectedCellsStore.gridData" />
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss" src="./App.scss" />
