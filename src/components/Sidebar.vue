<template>
  <aside class="sidebar" :class="{ open: isOpen }">
    <div class="sidebar-header">
      <h3>Explorer</h3>
      <button class="new-doc-btn header-btn" @click="createNewDocument" :disabled="isLoading" title="新建文档">
        <span>+</span>
      </button>
      <button class="close-btn header-btn" @click="closeSidebar" title="关闭侧边栏">
        <span>×</span>
      </button>
    </div>

    <div class="sidebar-content">

      <div class="documents-list">
        <div
          v-for="doc in documents"
          :key="doc.id"
          class="document-item"
          :class="{ active: doc.id === currentDocumentId }"
        >
          <div class="document-info" @click="loadDocument(doc.id)">
            <div class="document-name">{{ doc.name }}</div>
            <div class="document-date">
              {{ new Date(doc.updatedAt).toLocaleDateString() }}
            </div>
          </div>
          <button
            class="delete-btn"
            @click.stop="deleteDocument(doc.id)"
            title="删除文档"
            :disabled="isLoading"
          >
            <span>×</span>
          </button>
        </div>
      </div>

      <div v-if="documents.length === 0" class="empty-state">
        <p>No documents found</p>
        <p>click "New" to create a new document</p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { createGridData } from '@/utils/data.ts'
import { DOCUMENTS_STORE, getDBManager } from '@/utils/db.ts'
import type { DocumentData } from '../../env'

const emit = defineEmits<{
  selected: [document: DocumentData]
  created: [document: DocumentData]
  close: []
}>()

const props = defineProps<{
  isOpen: boolean
  currentDocumentId: string
}>()

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      loadAllDocuments()
    }
  }
)

// 内部状态
const isLoading = ref(false)
const documents = ref<DocumentData[]>([])

// 加载所有文档
const loadAllDocuments = async () => {
  try {
    const dbManager = getDBManager()
    const docs = await dbManager?.getAll<DocumentData>(DOCUMENTS_STORE)
    documents.value =
      docs?.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()) || []
  } catch (error) {
    console.error('failed to load documents:', error)
  }
}

// 加载指定文档
const loadDocument = async (documentId: string) => {
  try {
    const dbManager = getDBManager()
    isLoading.value = true
    const document = await dbManager?.get<DocumentData>(DOCUMENTS_STORE, documentId)
    if (document && document.gridData) {
      emit('selected', document)
    }
  } catch (error) {
    console.error('加载文档失败:', error)
    throw error
  } finally {
    isLoading.value = false
  }
}

// 创建新文档
const createNewDocument = async () => {
  try {
    isLoading.value = true

    const newDocument: DocumentData = {
      id: Date.now().toString(),
      name: '📄untitled',
      gridData: createGridData(4, 4),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const dbManager = getDBManager()
    await dbManager?.put(DOCUMENTS_STORE, newDocument)

    // 刷新文档列表
    await loadAllDocuments()

    // 通知父组件
    emit('created', newDocument)
  } catch (error) {
    console.error('failed to create new document:', error)
  } finally {
    isLoading.value = false
  }
}

// 删除文档
const deleteDocument = async (documentId: string) => {
  try {
    isLoading.value = true

    const document = documents.value.find((doc) => doc.id === documentId)
    if (!document) return

    const isConfirmed = confirm(`Confirm delete "${document.name}"？this action can't be undone`)
    if (!isConfirmed) return

    const dbManager = getDBManager()
    await dbManager?.delete(DOCUMENTS_STORE, documentId)

    // 刷新文档列表
    await loadAllDocuments()
  } catch (error) {
    console.error('删除文档失败:', error)
    alert('删除文档失败，请重试')
  } finally {
    isLoading.value = false
  }
}

// 关闭侧边栏
const closeSidebar = () => {
  // 通过事件通知父组件关闭
  emit('close')
}

// 暴露方法给父组件
defineExpose({
  refreshDocuments: loadAllDocuments,
})
</script>

<style scoped lang="scss">
.sidebar {
  width: 280px;
  height: 100vh;
  background-color: #f8f9fa;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  position: absolute;
  left: -280px;
  top: 0;
  z-index: 1000;
  transition: left 0.3s ease;

  &.open {
    left: 0;
  }

  .sidebar-header {
    height: 50px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid #e0e0e0;
    background-color: white;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: #333;
      flex: 1;
    }

    .header-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #666;
      padding: 4px;
      border-radius: 4px;
      transition: background-color 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
    }

    .new-doc-btn.header-btn {
      background: none;
      color: #666;
      font-size: 20px;

      &:hover:not(:disabled) {
        background-color: #f0f0f0;
        color: #007bff;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #666;
      padding: 4px;
      border-radius: 4px;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f0f0f0;
      }
    }
  }

  .sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    .new-doc-btn {
      width: 100%;
      padding: 10px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-bottom: 16px;
      transition: background-color 0.2s;

      &:hover:not(:disabled) {
        background-color: #0056b3;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      span {
        margin-right: 4px;
      }
    }

    .documents-list {
      .document-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px;
        margin-bottom: 8px;
        background-color: white;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        transition: all 0.2s;

        &:hover {
          border-color: #007bff;
          box-shadow: 0 2px 4px rgba(0, 123, 255, 0.1);
        }

        &.active {
          border-color: #007bff;
          background-color: #e7f3ff;
        }

        .document-info {
          flex: 1;
          cursor: pointer;
          min-width: 0;
        }

        .document-name {
          font-size: 14px;
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 400px;
        }

        .document-date {
          font-size: 12px;
          color: #666;
        }

        .delete-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #dc3545;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s;
          margin-left: 8px;
          flex-shrink: 0;

          &:hover:not(:disabled) {
            background-color: #dc3545;
            color: white;
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          span {
            display: block;
            line-height: 1;
          }
        }
      }
    }

    .empty-state {
      text-align: center;
      color: #666;
      padding: 40px 20px;

      p {
        margin: 8px 0;
        font-size: 14px;
      }
    }
  }
}
</style>
