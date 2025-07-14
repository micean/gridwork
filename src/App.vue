<script setup lang="ts">
import TableComponent from './components/TableComponent.vue'
import { createCellData, createGridData, createRowData } from '@/utils/data.ts'
import { ref } from 'vue'
import { useSelectedCellsStore } from '@/stores/selectedCells.ts'
import type { CellData } from '../env'

const vars = ref({
  gridData: createGridData(4, 4),
})
const selectedCellsStore = useSelectedCellsStore()

const addRowCol = (edge: 'top' | 'bottom' | 'left' | 'right') => {
  if (selectedCellsStore.selectedCells.length !== 1) return

  let originCellPath = selectedCellsStore.selectedCells[0]
  const parts = originCellPath.split('>').map((it) => JSON.parse(it))
  const [row, col] = parts.pop()
  const parentGrid: CellData[][] = !parts.length
    ? vars.value.gridData
    : parts.reduce((acc, cur) => {
        const [row, col] = cur
        const it = (acc.innerGrid || acc)[row][col]
        return it.innerGrid
      }, vars.value.gridData)

  
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
        eachRow.splice(col + 1, 0, createCellData())
      })
      originCellPath = parts.length
        ? `${parts.join('>')}>[${row},${col + 1}]`
        : `[${row},${col + 1}]`
      break
    case 'right':
      parentGrid.forEach((eachRow) => {
        eachRow.splice(col, 0, createCellData())
      })
      break
  }
  console.log(originCellPath)
  selectedCellsStore.addCellOnClick(originCellPath)
}
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <div class="toolbar">
        <i
          title="向上增加一行"
          @click="addRowCol('top')"
          :class="{ disabled: selectedCellsStore.selectedCells.length !== 1 }"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="currentColor"
          >
            <path
              d="M12 13.9142L16.7929 18.7071L18.2071 17.2929L12 11.0858L5.79289 17.2929L7.20711 18.7071L12 13.9142ZM6 7L18 7V9L6 9L6 7Z"
            ></path></svg
        ></i>
        <i
          title="向右增加一列"
          @click="addRowCol('right')"
          :class="{ disabled: selectedCellsStore.selectedCells.length !== 1 }"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="currentColor"
          >
            <path
              d="M10.0858 12L5.29289 16.7929L6.70711 18.2071L12.9142 12L6.70711 5.79291L5.29289 7.20712L10.0858 12ZM17 6.00002L17 18H15L15 6.00002L17 6.00002Z"
            ></path></svg
        ></i>
        <i
          title="向下增加一行"
          @click="addRowCol('bottom')"
          :class="{ disabled: selectedCellsStore.selectedCells.length !== 1 }"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="currentColor"
          >
            <path
              d="M12 10.0858L7.20711 5.29291L5.79289 6.70712L12 12.9142L18.2071 6.70712L16.7929 5.29291L12 10.0858ZM18 17L6 17L6 15L18 15V17Z"
            ></path></svg
        ></i>
        <i
          title="向左增加一列"
          @click="addRowCol('left')"
          :class="{ disabled: selectedCellsStore.selectedCells.length !== 1 }"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="currentColor"
          >
            <path
              d="M13.9142 12L18.7071 7.20712L17.2929 5.79291L11.0858 12L17.2929 18.2071L18.7071 16.7929L13.9142 12ZM7 18V6.00001H9V18H7Z"
            ></path></svg
        ></i>
      </div>
    </header>
    <main class="editor-area">
      <div class="editor-content">
        <TableComponent v-model="vars.gridData" />
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss" src="./App.scss" />
