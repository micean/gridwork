/**
 * PeerJS 工具类使用示例
 * 展示如何在项目中使用 PeerManager
 */

import { createPeerManager, destroyPeerManager } from './peer'

// 示例：基本使用
async function basicExample() {
  try {
    // 创建PeerManager实例
    const peerManager = createPeerManager({
      host: '0.peerjs.com',
      port: 443,
      secure: true,
      debug: 2
    })

    // 设置事件回调
    peerManager.setCallbacks({
      onOpen: (id) => {
        console.log('Peer连接已建立，ID:', id)
        // 显示当前Peer ID给用户
        displayPeerId(id)
      },
      
      onConnection: (connection) => {
        console.log('新的连接:', connection.peer)
        // 可以在这里发送欢迎消息
        connection.send({
          type: 'welcome',
          message: 'Hello! You are now connected.'
        })
      },
      
      onDisconnection: (peerId) => {
        console.log('连接断开:', peerId)
        // 更新UI显示连接状态
        updateConnectionStatus(peerId, false)
      },
      
      onData: (message, connection) => {
        console.log('收到数据:', message)
        handleIncomingData(message, connection)
      },
      
      onError: (error) => {
        console.error('Peer错误:', error)
        // 显示错误信息给用户
        showError(error.message)
      }
    })

    // 初始化Peer连接
    const peerId = await peerManager.initialize()
    console.log('初始化成功，Peer ID:', peerId)

  } catch (error) {
    console.error('初始化失败:', error)
  }
}

// 示例：连接到其他Peer
async function connectToPeerExample(targetPeerId: string) {
  const peerManager = createPeerManager()
  
  try {
    await peerManager.initialize()
    
    // 连接到目标Peer
    const connection = await peerManager.connectToPeer(targetPeerId)
    console.log('成功连接到:', targetPeerId)
    
    // 发送数据
    await peerManager.sendToPeer(targetPeerId, {
      type: 'chat',
      message: 'Hello from ' + peerManager.getPeerId()
    })
    
  } catch (error) {
    console.error('连接失败:', error)
  }
}

// 示例：数据传输
async function dataTransferExample() {
  const peerManager = createPeerManager()
  
  await peerManager.initialize()
  
  // 发送不同类型的数据
  const sendData = async (peerId: string) => {
    // 发送文本消息
    await peerManager.sendToPeer(peerId, {
      type: 'text',
      content: 'Hello World!'
    })
    
    // 发送JSON数据
    await peerManager.sendToPeer(peerId, {
      type: 'json',
      data: { key: 'value', array: [1, 2, 3] }
    })
    
    // 发送文件数据（假设是base64编码）
    await peerManager.sendToPeer(peerId, {
      type: 'file',
      name: 'document.txt',
      content: 'base64-encoded-content',
      size: 1024
    })
    
    // 发送网格数据
    await peerManager.sendToPeer(peerId, {
      type: 'grid-data',
      grid: [
        [{ text: 'A1' }, { text: 'B1' }],
        [{ text: 'A2' }, { text: 'B2' }]
      ]
    })
  }
}

// 示例：广播消息
async function broadcastExample() {
  const peerManager = createPeerManager()
  
  await peerManager.initialize()
  
  // 向所有连接的Peer广播消息
  await peerManager.broadcast({
    type: 'broadcast',
    message: 'This is a broadcast message!',
    from: peerManager.getPeerId()
  })
}

// 示例：连接管理
async function connectionManagementExample() {
  const peerManager = createPeerManager()
  
  await peerManager.initialize()
  
  // 获取连接状态
  const status = peerManager.getConnectionStatus()
  console.log('连接状态:', status)
  
  // 监听连接变化
  setInterval(() => {
    const currentStatus = peerManager.getConnectionStatus()
    updateUI(currentStatus)
  }, 5000)
  
  // 断开特定连接
  const disconnectPeer = (peerId: string) => {
    peerManager.disconnectFromPeer(peerId)
  }
  
  // 断开所有连接
  const disconnectAll = () => {
    peerManager.disconnectAll()
  }
}

// 示例：错误处理
async function errorHandlingExample() {
  const peerManager = createPeerManager()
  
  peerManager.setCallbacks({
    onError: (error) => {
      if (error.message.includes('ID taken')) {
        console.log('Peer ID已被占用，请使用其他ID')
      } else if (error.message.includes('network')) {
        console.log('网络连接问题，请检查网络设置')
      } else {
        console.error('未知错误:', error)
      }
    }
  })
  
  try {
    await peerManager.initialize()
  } catch (error) {
    console.error('初始化失败:', error)
  }
}

// 示例：Vue组件集成
function vueIntegrationExample() {
  // 在Vue组件中使用
  return {
    data() {
      return {
        peerManager: null as any,
        peerId: '',
        connections: [] as string[],
        messages: [] as any[]
      }
    },
    
    async mounted() {
      const peerManager = createPeerManager()
      ;(this as any).peerManager = peerManager
      
      peerManager.setCallbacks({
        onOpen: (id: string) => {
          (this as any).peerId = id
        },
        
        onConnection: (connection: any) => {
          (this as any).connections.push(connection.peer)
        },
        
        onDisconnection: (peerId: string) => {
          (this as any).connections = (this as any).connections.filter((id: string) => id !== peerId)
        },
        
        onData: (message: any) => {
          (this as any).messages.push(message)
        }
      })
      
      await peerManager.initialize()
    },
    
    beforeUnmount() {
      if ((this as any).peerManager) {
        destroyPeerManager()
      }
    },
    
    methods: {
      async connectToPeer(peerId: string) {
        try {
          await (this as any).peerManager.connectToPeer(peerId)
        } catch (error) {
          console.error('连接失败:', error)
        }
      },
      
      async sendMessage(peerId: string, message: string) {
        try {
          await (this as any).peerManager.sendToPeer(peerId, {
            type: 'chat',
            content: message
          })
        } catch (error) {
          console.error('发送失败:', error)
        }
      }
    }
  }
}

// 辅助函数（示例用）
function displayPeerId(id: string) {
  console.log('显示Peer ID:', id)
}

function updateConnectionStatus(peerId: string, isConnected: boolean) {
  console.log(`Peer ${peerId} 连接状态: ${isConnected ? '已连接' : '已断开'}`)
}

function handleIncomingData(message: any, connection: any) {
  console.log('处理收到的数据:', message)
}

function showError(message: string) {
  console.error('显示错误:', message)
}

function updateUI(status: any) {
  console.log('更新UI:', status)
}

// 导出示例函数供使用
export {
  basicExample,
  connectToPeerExample,
  dataTransferExample,
  broadcastExample,
  connectionManagementExample,
  errorHandlingExample,
  vueIntegrationExample
}