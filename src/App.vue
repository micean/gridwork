<script setup lang="ts">
import TableComponent from './components/TableComponent.vue'
import HeaderToolbar from './components/HeaderToolbar.vue'
import Sidebar from './components/Sidebar.vue'
import { createGridData } from '@/utils/data.ts'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useDocumentStore } from '@/stores/document.ts'
import { useHistoryStore } from '@/stores/history.ts'
import { usePeerStore } from '@/stores/peer.ts'
import { createDBManager, DOCUMENTS_STORE } from '@/utils/db.ts'
import type { DocumentData } from '../env'
import emitter from '@/utils/bus.ts'
import { copyEventListener, cutEventListener, pasteEventListener } from '@/utils/clipboard.ts'
import { preventBrowserZoom, wheelEventListener } from '@/keys.ts'
import type { DataMessage } from '@/utils/peer.ts'
import { useModeStore } from '@/stores/mode.ts'

const gridData = createGridData(4, 4)
const vars = ref({
  isLoading: false,
  dbError: null as string | null,
  documentName: '📄untitled',
  isEditingDocumentName: false,
  isSidebarOpen: false,
  connectionStatus: null as string | null,
  showConnectionOverlay: false,
})
const documentStore = useDocumentStore()
const historyStore = useHistoryStore()
const peerStore = usePeerStore()
const modeStore = useModeStore()
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
    if (!modeStore.readonly) {
      await loadRecentDocument()
    }
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
    modeStore.setReadonly(false)
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
    modeStore.setReadonly(false)
  } catch (error) {
    console.error('create document failed:', error)
  } finally {
    vars.value.isLoading = false
  }
}

const handleDocumentLoaded = (document: DocumentData) => {
  try {
    vars.value.isLoading = true
    documentStore.loadDoc(document)
    historyStore.initialize(JSON.stringify(document.gridData))
    vars.value.documentName = document.name
    if (document.id) currentDocumentId.value = document.id
    modeStore.setReadonly(false)
  } catch (error) {
    console.error('load document failed:', error)
    throw error
  } finally {
    vars.value.isLoading = false
  }
}

// 处理接收到的peer数据
const handlePeerData = (data: DataMessage) => {
  const { type, payload } = data
  if (type === 'document') {
    const doc = payload.data as DocumentData
    documentStore.loadDoc(doc)
    vars.value.documentName = doc.name
  }
}

// 处理URL中的peerId参数
const handleUrlPeerId = async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const peerId = urlParams.get('peerId')

  if (peerId) {
    // 显示连接中状态
    vars.value.connectionStatus = `正在连接到 ${peerId}...`
    vars.value.showConnectionOverlay = true

    try {
      // 获取peerManager实例
      peerStore.setOnErrorListener((error: Error) => {
        console.error('连接失败:', error)
        vars.value.connectionStatus = `连接失败: ${error.message}`
        peerStore.cleanupPeer()
        // 3秒后隐藏浮动层
        setTimeout(() => {
          vars.value.showConnectionOverlay = false
        }, 3000)
      })
      peerStore.receiveData((data: DataMessage) => {
        handlePeerData(data)
      })
      await peerStore.initializePeer()
      await peerStore.connectToPeer(peerId)

      // 连接成功
      vars.value.connectionStatus = `已连接到 ${peerId}`
      modeStore.setReadonly(true)

      // 2秒后隐藏浮动层
      setTimeout(() => {
        vars.value.showConnectionOverlay = false
      }, 2000)
    } catch (error) {
      console.error('连接失败:', error)
      vars.value.connectionStatus = `连接失败: ${error instanceof Error ? error.message : '未知错误'}`
      peerStore.cleanupPeer()
      // 3秒后隐藏浮动层
      setTimeout(() => {
        vars.value.showConnectionOverlay = false
      }, 3000)
    }
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
  if (modeStore.readonly) return
  historyStore.addHistory(JSON.stringify(documentStore.gridData), documentStore.selectedCells)
  if (peerStore.isConnected) {
    const data = documentStore.getDocument()
    peerStore.broadcast({ type: 'document', data })
  }
}

const startEditingDocumentName = () => {
  if (modeStore.readonly) return
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
  if (peerStore.isConnected) {
    const data = documentStore.getDocument()
    peerStore.broadcast({ type: 'document', data })
  }
}

const cancelEditingDocumentName = () => {
  vars.value.isEditingDocumentName = false
  vars.value.documentName = documentStore.title
}

let cleanupZoom: (() => void) | null = null

onMounted(() => {
  // 处理URL中的peerId参数
  handleUrlPeerId()
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

  // 清理peer连接
  peerStore.cleanupPeer()

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
              :class="{ 'document-name': true, readonly: modeStore.readonly }"
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
          <HeaderToolbar ref="toolBar" @document-loaded="handleDocumentLoaded" />
        </div>
      </header>

      <main class="editor-area" @click="handleClickOutside">
        <TableComponent
          v-model="documentStore.gridData"
          :class="{ readonly: modeStore.readonly }"
          :style="{
            borderStyle: documentStore.isZoomed() ? 'dotted' : undefined,
          }"
        />
      </main>
    </div>
  </div>

  <!-- 连接状态浮动层 -->
  <div v-if="vars.showConnectionOverlay" class="connection-overlay">
    <div class="connection-content">
      {{ vars.connectionStatus }}
    </div>
  </div>
</template>

<style scoped lang="scss" src="./App.scss" />
