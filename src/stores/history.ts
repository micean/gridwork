import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface HistoryState {
  gridData: string
  selectedCells?: string[]
  timestamp: number
}

const maxHistorySize = 20 // 最多保存20条历史记录
export const useHistoryStore = defineStore('history', () => {
  const history = ref<HistoryState[]>([])
  const currentIndex = ref(-1)

  const canUndo = computed(() => {
    return currentIndex.value > 0
  })
  const canRedo = computed(() => {
    return currentIndex.value < history.value.length - 1
  })

  const addHistory = (gridData: string, selectedCells?: string[]) => {
    if(gridData === history.value[currentIndex.value]?.gridData){
      return
    }

    // 如果当前不是最新状态，删除后面的历史
    if (currentIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, currentIndex.value + 1)
    }

    // 添加新历史记录
    history.value.push({
      gridData,
      selectedCells,
      timestamp: Date.now(),
    })

    // 限制历史记录数量
    if (history.value.length > maxHistorySize) {
      history.value.shift()
    } else {
      currentIndex.value++
    }
  }

  const undo = (): HistoryState | null => {
    if (!canUndo.value) return null

    currentIndex.value--

    // 返回当前状态的深拷贝
    return history.value[currentIndex.value]
  }

  const redo = (): HistoryState | null => {
    if (!canRedo.value) return null

    currentIndex.value++

    // 返回当前状态的深拷贝
    return history.value[currentIndex.value]
  }

  const clear = () => {
    history.value = []
    currentIndex.value = -1
  }

  const initialize = (initialData: string) => {
    clear()
    addHistory(initialData)
  }

  return {
    history,
    currentIndex,
    canUndo,
    canRedo,
    addHistory,
    undo,
    redo,
    clear,
    initialize,
  }
})
