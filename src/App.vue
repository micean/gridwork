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
        const it = acc[row][col]
        return it.innerGrid || []
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
  selectedCellsStore.addCellOnClick(originCellPath)
}

const removeRowCol = (type: 'row' | 'col') => {
  if (!selectedCellsStore.selectedCells.length) return

  // // 按网格分组处理选中单元格
  // const gridGroups = new Map<string, { grid: CellData[][], rows: Set<number>, cols: Set<number> }>()
  //
  // // 遍历所有选中的单元格
  // selectedCellsStore.selectedCells.forEach(cellPath => {
  //   const parts = cellPath.split('>').map((it) => JSON.parse(it))
  //   const [row, col] = parts.pop()
  //
  //   // 构建网格路径作为key
  //   const gridKey = parts.length ? parts.join('>') : 'root'
  //
  //   // 获取或创建网格组
  //   if (!gridGroups.has(gridKey)) {
  //     const parentGrid: CellData[][] = !parts.length
  //       ? vars.value.gridData
  //       : parts.reduce((acc, cur) => {
  //           const [r, c] = cur
  //           const it = (acc.innerGrid || acc)[r][c]
  //           return it.innerGrid
  //         }, vars.value.gridData)
  //
  //     gridGroups.set(gridKey, {
  //       grid: parentGrid,
  //       rows: new Set<number>(),
  //       cols: new Set<number>()
  //     })
  //   }
  //
  //   const group = gridGroups.get(gridKey)!
  //   group.rows.add(row)
  //   group.cols.add(col)
  // })
  //
  // // 对每个网格执行删除操作
  // gridGroups.forEach(({ grid, rows, cols }) => {
  //   if (type === 'row') {
  //     // 按行号降序排序，避免删除后索引变化
  //     const sortedRows = Array.from(rows).sort((a, b) => b - a)
  //
  //     // 检查是否可以删除（至少保留1行）
  //     if (grid.length - sortedRows.length >= 1) {
  //       sortedRows.forEach(rowIndex => {
  //         if (rowIndex < grid.length) {
  //           grid.splice(rowIndex, 1)
  //         }
  //       })
  //     }
  //   } else if (type === 'col') {
  //     // 按列号降序排序，避免删除后索引变化
  //     const sortedCols = Array.from(cols).sort((a, b) => b - a)
  //
  //     // 检查是否可以删除（至少保留1列）
  //     if (grid[0] && grid[0].length - sortedCols.length >= 1) {
  //       sortedCols.forEach(colIndex => {
  //         if (colIndex < grid[0].length) {
  //           grid.forEach(row => {
  //             row.splice(colIndex, 1)
  //           })
  //         }
  //       })
  //     }
  //   }
  // })
  const posArr = selectedCellsStore.selectedCells.map(path => {
    const parts: [number, number][] = path.split('>').map((it) => JSON.parse(it))
    const pos: [number, number] = parts.pop()!
    return { parts, pos }
  })
  const parentGrid: CellData[][] = !posArr[0].parts.length
    ? vars.value.gridData
    : posArr[0].parts.reduce((acc, cur) => {
      const [row, col] = cur
      const it = acc[row][col]
      return it.innerGrid || []
    }, vars.value.gridData)

  switch (type) {
    case 'row':
      posArr.map(it => it.pos[0]).filter((e, i, self) => i === self.indexOf(e)).sort().forEach((row, index) => {
        parentGrid.splice(row - index, 1)
      })
      if(parentGrid.length === 0) {
        parentGrid.push(createRowData(1))
      }
      break
    case 'col':
      posArr.map(it => it.pos[1]).filter((e, i, self) => i === self.indexOf(e)).sort().forEach((col, index) => {
        parentGrid.forEach(row => row.splice(col - index, 1))
      })
      if(parentGrid[0]?.length === 0) {
        parentGrid.splice(0, parentGrid.length)
        parentGrid.push(createRowData(1))
      }
      break
  }

  // 清除选中状态，因为删除后原位置可能不存在
  selectedCellsStore.clearSelection()
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
          >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 13C14.7614 13 17 15.2386 17 18C17 20.7614 14.7614 23 12 23C9.23858 23 7 20.7614 7 18C7 15.2386 9.23858 13 12 13ZM13 15H11V16.999L9 17V19L11 18.999V21H13V18.999L15 19V17L13 16.999V15ZM20 3C20.5523 3 21 3.44772 21 4V10C21 10.5523 20.5523 11 20 11H4C3.44772 11 3 10.5523 3 10V4C3 3.44772 3.44772 3 4 3H20ZM5 5V9H19V5H5Z"></path></svg>
        </i>
        <i
          title="向右增加一列"
          @click="addRowCol('right')"
          :class="{ disabled: selectedCellsStore.selectedCells.length !== 1 }"
          >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M10 3C10.5523 3 11 3.44772 11 4V20C11 20.5523 10.5523 21 10 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3H10ZM9 5H5V19H9V5ZM18 7C20.7614 7 23 9.23858 23 12C23 14.7614 20.7614 17 18 17C15.2386 17 13 14.7614 13 12C13 9.23858 15.2386 7 18 7ZM19 9H17V10.999L15 11V13L17 12.999V15H19V12.999L21 13V11L19 10.999V9Z"></path></svg>
        </i>
        <i
          title="向下增加一行"
          @click="addRowCol('bottom')"
          :class="{ disabled: selectedCellsStore.selectedCells.length !== 1 }"
          >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 13C20.5523 13 21 13.4477 21 14V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V14C3 13.4477 3.44772 13 4 13H20ZM19 15H5V19H19V15ZM12 1C14.7614 1 17 3.23858 17 6C17 8.76142 14.7614 11 12 11C9.23858 11 7 8.76142 7 6C7 3.23858 9.23858 1 12 1ZM13 3H11V4.999L9 5V7L11 6.999V9H13V6.999L15 7V5L13 4.999V3Z"></path></svg>
        </i>
        <i
          title="向左增加一列"
          @click="addRowCol('left')"
          :class="{ disabled: selectedCellsStore.selectedCells.length !== 1 }"
          >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 3C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H14C13.4477 21 13 20.5523 13 20V4C13 3.44772 13.4477 3 14 3H20ZM19 5H15V19H19V5ZM6 7C8.76142 7 11 9.23858 11 12C11 14.7614 8.76142 17 6 17C3.23858 17 1 14.7614 1 12C1 9.23858 3.23858 7 6 7ZM7 9H5V10.999L3 11V13L5 12.999V15H7V12.999L9 13V11L7 10.999V9Z"></path></svg>
        </i>
        <i
          title="删除行"
          @click="removeRowCol('row')"
          :class="{ disabled: !selectedCellsStore.selectedCells.length}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 5C20.5523 5 21 5.44772 21 6V12C21 12.5523 20.5523 13 20 13C20.628 13.8355 21 14.8743 21 16C21 18.7614 18.7614 21 16 21C13.2386 21 11 18.7614 11 16C11 14.8743 11.372 13.8355 11.9998 12.9998L4 13C3.44772 13 3 12.5523 3 12V6C3 5.44772 3.44772 5 4 5H20ZM13 15V17H19V15H13ZM19 7H5V11H19V7Z"></path></svg>
        </i>
        <i
          title="删除列"
          @click="removeRowCol('col')"
          :class="{ disabled: !selectedCellsStore.selectedCells.length}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 3C12.5523 3 13 3.44772 13 4L12.9998 11.9998C13.8355 11.372 14.8743 11 16 11C18.7614 11 21 13.2386 21 16C21 18.7614 18.7614 21 16 21C14.9681 21 14.0092 20.6874 13.2129 20.1518L13 20C13 20.5523 12.5523 21 12 21H6C5.44772 21 5 20.5523 5 20V4C5 3.44772 5.44772 3 6 3H12ZM11 5H7V19H11V5ZM19 15H13V17H19V15Z"></path></svg>
        </i>
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
