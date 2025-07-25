<script setup lang="ts">
import TableComponent from './components/TableComponent.vue'
import HeaderToolbar from './components/HeaderToolbar.vue'
import Sidebar from './components/Sidebar.vue'
import { createGridData } from '@/utils/data.ts'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useDocumentStore } from '@/stores/document.ts'
import { useHistoryStore } from '@/stores/history.ts'
import { createDBManager, DOCUMENTS_STORE } from '@/utils/db.ts'
import type { DocumentData } from '../env'
import { copyEventListener, cutEventListener, pasteEventListener } from '@/utils/clipboard.ts'
import { wheelEventListener, preventBrowserZoom } from '@/keys.ts'

const gridData = createGridData(4, 4)
const vars = ref({
  isLoading: false,
  dbError: null as string | null,
  documentName: '📄untitled',
  isEditingDocumentName: false,
  isSidebarOpen: false,
})
const documentStore = useDocumentStore()
const historyStore = useHistoryStore()
const toolBar = ref<InstanceType<typeof HeaderToolbar> | null>(null)
const sidebarRef = ref<InstanceType<typeof Sidebar> | null>(null)

// 创建数据库管理器实例
const dbManager = createDBManager()

// 响应式文档ID
const currentDocumentId = ref(localStorage.getItem('lastDocumentId') || '')

documentStore.setupGrid(gridData)
historyStore.initialize(JSON.stringify(gridData))

// 数据库相关函数
const initDatabase = async () => {
  try {
    vars.value.isLoading = true
    vars.value.dbError = null

    await dbManager.init()
    console.log('database initialized')

    // 尝试加载最近的文档
    await loadRecentDocument()
  } catch (error) {
    console.error('database initialization failed:', error)
    vars.value.dbError = 'database initialization failed，please try again'
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
      currentDocumentId.value = lastDocumentId
    }
  } catch (error) {
    console.error('loading recent document failed:', error)
  }
}

const handleSelectDocument = async (document: DocumentData) => {
  try {
    vars.value.isLoading = true
    documentStore.loadDoc(document)
    historyStore.initialize(JSON.stringify(document.gridData))
    vars.value.documentName = document.name
    localStorage.setItem('lastDocumentId', document.id)
    currentDocumentId.value = document.id
  } catch (error) {
    console.error('load document failed:', error)
    throw error
  } finally {
    vars.value.isLoading = false
  }
}

const handleCreateDocument = async (document: DocumentData) => {
  try {
    vars.value.isLoading = true

    // 加载新文档
    documentStore.loadDoc(document)
    historyStore.initialize(JSON.stringify(document.gridData))
    vars.value.documentName = document.name
    localStorage.setItem('lastDocumentId', document.id)
    currentDocumentId.value = document.id
  } catch (error) {
    console.error('create document failed:', error)
  } finally {
    vars.value.isLoading = false
  }
}

const toggleSidebar = () => {
  vars.value.isSidebarOpen = !vars.value.isSidebarOpen
}

// 添加和移除事件监听
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement

  // 检查点击是否在.editor-content内
  const isInsideEditorContent = target.closest('.adaptive-table')

  // 如果点击在.editor-content外，清除选定和编辑状态
  if (!isInsideEditorContent) {
    documentStore.clearSelection()
    documentStore.setEditingCell(null)
  }

  // 原有的弹窗关闭逻辑
  if (!target.closest('.color-popup') && !target.closest('[title="颜色"]')) {
    toolBar.value?.closePopup('color')
  }
  if (!target.closest('.font-size-popup') && !target.closest('[title="字体大小"]')) {
    toolBar.value?.closePopup('fontSize')
  }
  if (!target.closest('.search-popup') && !target.closest('[title="搜索"]')) {
    toolBar.value?.closePopup('search')
  }
}
const handleEditorBlur = () => {
  historyStore.addHistory(JSON.stringify(documentStore.gridData), documentStore.selectedCells)
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

let cleanupZoom: (() => void) | null = null

onMounted(() => {
  // 初始化数据库
  initDatabase()

  // 阻止浏览器默认缩放
  cleanupZoom = preventBrowserZoom()

  document.addEventListener('paste', pasteEventListener)
  document.addEventListener('copy', copyEventListener)
  document.addEventListener('cut', cutEventListener)
  document.addEventListener('wheel', wheelEventListener, { passive: false })
  window.addEventListener('editor-blur', handleEditorBlur as EventListener)
})

onUnmounted(() => {
  document.removeEventListener('paste', pasteEventListener)
  document.removeEventListener('copy', copyEventListener)
  document.removeEventListener('cut', cutEventListener)
  document.removeEventListener('wheel', wheelEventListener)
  window.removeEventListener('editor-blur', handleEditorBlur as EventListener)

  // 清理浏览器缩放阻止
  if (cleanupZoom) {
    cleanupZoom()
  }
})
</script>

<template>
  <div class="app-container">
    <!-- 侧边栏 -->
    <Sidebar
      :is-open="vars.isSidebarOpen"
      :current-document-id="currentDocumentId"
      @selected="handleSelectDocument"
      @created="handleCreateDocument"
      @close="toggleSidebar"
      ref="sidebarRef"
    />

    <!-- 主内容区 -->
    <div class="main-content" :class="{ 'sidebar-open': vars.isSidebarOpen }">
      <header class="app-header">
        <div class="header-left">
          <button class="sidebar-toggle" @click="toggleSidebar" title="切换侧边栏">
            <span>☰</span>
          </button>
          <div class="document-name-container">
            <span
              v-if="!vars.isEditingDocumentName"
              class="document-name"
              @dblclick="startEditingDocumentName"
              :title="vars.documentName"
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
          <HeaderToolbar ref="toolBar" />
        </div>
      </header>

      <main class="editor-area" @click="handleClickOutside">
        <TableComponent
          v-model="documentStore.gridData"
          :style="{
            borderStyle: documentStore.isZoomed() ? 'dotted' : undefined,
          }"
        />
      </main>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./App.scss" />
