<script setup lang="ts">
import TableComponent from './components/TableComponent.vue'
import HeaderToolbar from './components/HeaderToolbar.vue'
import { createGridData } from '@/utils/data.ts'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useDocumentStore } from '@/stores/document.ts'
import { useHistoryStore } from '@/stores/history.ts'
import { createDBManager, DOCUMENTS_STORE } from '@/utils/db.ts'
import type { DocumentData } from '../env'
import { copyEventListener, cutEventListener, pasteEventListener } from '@/utils/clipboard.ts'
import { wheelEventListener } from '@/keys.ts'

const gridData = createGridData(4, 4)
const vars = ref({
  isLoading: false,
  dbError: null as string | null,
  documentName: '📄untitled',
  isEditingDocumentName: false,
})
const documentStore = useDocumentStore()
const historyStore = useHistoryStore()
const toolBar = ref<InstanceType<typeof HeaderToolbar> | null>(null)

// 创建数据库管理器实例
const dbManager = createDBManager()

documentStore.setupGrid(gridData)
historyStore.initialize(JSON.stringify(gridData))

// 数据库相关函数
const initDatabase = async () => {
  try {
    vars.value.isLoading = true
    vars.value.dbError = null

    await dbManager.init()
    console.log('数据库初始化成功')

    // 尝试加载最近的文档
    await loadRecentDocument()
  } catch (error) {
    console.error('数据库初始化失败:', error)
    vars.value.dbError = '数据库初始化失败，请刷新页面重试'
  } finally {
    vars.value.isLoading = false
  }
}

const loadRecentDocument = async () => {
  try {
    const lastDocumentId = localStorage.getItem('lastDocumentId')
    if (!lastDocumentId) return

    const document = await dbManager.get<DocumentData>(DOCUMENTS_STORE, lastDocumentId)
    if (document && document.gridData) {
      documentStore.loadDoc(document)
      historyStore.initialize(JSON.stringify(document.gridData))
      vars.value.documentName = document.name
      console.log('加载最近文档成功')
    }
  } catch (error) {
    console.error('加载最近项目失败:', error)
  }
}

// const loadDocument = async (documentId: string) => {
//   try {
//     const document = await dbManager.get<DocumentData>('projects', documentId)
//     if (document && document.gridData) {
//       documentStore.setupGrid(document.gridData)
//       historyStore.initialize(JSON.stringify(document.gridData))
//       localStorage.setItem('lastDocumentId', documentId.toString())
//       console.log('加载文档成功:', document.name)
//     }
//   } catch (error) {
//     console.error('加载文档失败:', error)
//     throw error
//   }
// }
//
// const getAllDocuments = async () => {
//   try {
//     const documents = await dbManager.getAll<DocumentData>('projects')
//     return documents.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
//   } catch (error) {
//     console.error('获取项目列表失败:', error)
//     throw error
//   }
// }

// 添加和移除事件监听
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement

  // 检查点击是否在.editor-content内
  const isInsideEditorContent = target.closest('.editor-content')

  // 如果点击在.editor-content外，清除选定和编辑状态
  if (!isInsideEditorContent) {
    documentStore.clearSelection()
    documentStore.setEditingCell(null)
  }

  // 原有的弹窗关闭逻辑
  if (!target.closest('.color-popup') && !target.closest('[title="颜色"]')) {
    toolBar.value?.closePopup('color')
  };
  if (!target.closest('.font-size-popup') && !target.closest('[title="字体大小"]')) {
    toolBar.value?.closePopup('fontSize')
  }
  if (!target.closest('.search-popup') && !target.closest('[title="搜索"]')) {
    toolBar.value?.closePopup('search')
  }
}
const handleEditorBlur = () => {
  historyStore.addHistory(
    JSON.stringify(documentStore.gridData),
    documentStore.selectedCells,
  )
}

const startEditingDocumentName = () => {
  vars.value.isEditingDocumentName = true
  nextTick(() => {
    const input = document.querySelector('.document-name-input') as HTMLInputElement
    input?.focus()
    input?.select()
  })
}

const saveDocumentName = () => {
  vars.value.isEditingDocumentName = false
  documentStore.updateDocumentName(vars.value.documentName)
}

const cancelEditingDocumentName = () => {
  vars.value.isEditingDocumentName = false
  vars.value.documentName = documentStore.title
}

onMounted(() => {
  // 初始化数据库
  initDatabase()

  document.addEventListener('paste', pasteEventListener)
  document.addEventListener('copy', copyEventListener)
  document.addEventListener('cut', cutEventListener)
  document.addEventListener('wheel', wheelEventListener)
  window.addEventListener('editor-blur', handleEditorBlur as EventListener)
})

onUnmounted(() => {
  document.removeEventListener('paste', pasteEventListener)
  document.removeEventListener('copy', copyEventListener)
  document.removeEventListener('cut', cutEventListener)
  document.removeEventListener('wheel', wheelEventListener)
  window.removeEventListener('editor-blur', handleEditorBlur as EventListener)
})
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-left">
        <div class="document-name-container">
          <span
            v-if="!vars.isEditingDocumentName"
            class="document-name"
            @dblclick="startEditingDocumentName"
            title="双击编辑标题"
          >
            {{ vars.documentName }}
          </span>
          <input
            v-else
            v-model="vars.documentName"
            class="document-name-input"
            @focus="() => documentStore.clearSelection()"
            @blur="saveDocumentName"
            @keyup.enter="saveDocumentName"
            @keyup.esc="cancelEditingDocumentName"
            placeholder="输入标题"
          />
        </div>
      </div>
      <div class="header-right">
        <HeaderToolbar ref="toolBar"/>
      </div>
    </header>
    <main class="editor-area" @click="handleClickOutside">
      <div class="editor-content">
        <TableComponent v-model="documentStore.gridData" />
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss" src="./App.scss" />
