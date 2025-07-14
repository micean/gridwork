import { nextTick } from 'vue'

export const selectionOnTail = (element: HTMLElement) => {
  element.focus()

  // Move cursor to the end of content
  const range = document.createRange()
  const selection = window.getSelection()

  if (element.childNodes.length > 0) {
    range.selectNodeContents(element)
    range.collapse(false) // false = collapse to end
    selection?.removeAllRanges()
    selection?.addRange(range)
  }
}

export const selectionOnEnter = (element: HTMLElement) => {
  const selection = window.getSelection()!
  const range = selection.getRangeAt(0)
  const startContainer = range.startContainer
  const startOffset = range.startOffset
  console.log(startContainer, startOffset)
  let pos = 0
  element.childNodes.forEach((node) => {
    if (![1, 3].includes(node.nodeType)) return
    if (node === startContainer) {
      pos += startOffset
    } else if (node.nodeType === 3) {
      pos += node.textContent?.length || 0
    } else {
      pos++
    }
  })
  const textContent = element.textContent || ''
  if (pos === textContent.length) {
    nextTick(() => {
      nextTick(() => selectionOnTail(element))
    })
    return textContent + (textContent.endsWith('\n') ? '\n' : '\n\n')
  } else {
    nextTick(() => {
      nextTick(() => {
        const p1 = 0
        element.childNodes.forEach((node) => {
          if (![1, 3].includes(node.nodeType)) return
          const len = node.nodeType === 3 ? node.textContent?.length || 0 : 1
          if (p1 + len < pos) return

          const range = document.createRange()
          range.setStart(node, pos - p1 + 1)
          range.collapse(false) // false = collapse to end
          const selection = window.getSelection()
          selection?.removeAllRanges()
          selection?.addRange(range)
        })
      })
    })
    return textContent.substring(0, pos) + '\n' + textContent.substring(pos)
  }
}

export const isCursorAtHead = (element: HTMLElement): boolean => {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return false
  if (!element.childNodes.length) return true

  const range = selection.getRangeAt(0)
  const startContainer = range.startContainer
  const startOffset = range.startOffset

  // 如果光标在第一个节点且偏移量为0，则在头部
  if (startOffset === 0) {
    let firstValidNode = null
    for (let i = 0; i < element.childNodes.length; i++) {
      const node = element.childNodes[i]
      if ([1, 3].includes(node.nodeType)) {
        firstValidNode = node
        break
      }
    }
    return startContainer === firstValidNode
  }

  return false
}

export const isCursorAtTail = (element: HTMLElement): boolean => {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return false
  if (!element.childNodes.length) return true

  const range = selection.getRangeAt(0)
  const startContainer = range.startContainer
  const startOffset = range.startOffset

  let pos = 0
  element.childNodes.forEach((node) => {
    if (![1, 3].includes(node.nodeType)) return
    if (node === startContainer) {
      pos += startOffset
    } else if (node.nodeType === 3) {
      pos += node.textContent?.length || 0
    } else {
      pos++
    }
  })

  const textContent = element.textContent || ''
  return pos === textContent.length
}
