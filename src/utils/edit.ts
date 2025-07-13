import {nextTick} from "vue";

export const selectionOnTail = (element: HTMLElement) => {
  element.focus();

  // Move cursor to the end of content
  const range = document.createRange();
  const selection = window.getSelection();

  if (element.childNodes.length > 0) {
    range.selectNodeContents(element);
    range.collapse(false); // false = collapse to end
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
}

export const selectionOnEnter = (element: HTMLElement) => {
  const selection = window.getSelection()!;
  const range = selection.getRangeAt(0);
  const startContainer = range.startContainer;
  const startOffset = range.startOffset;
  console.log(startContainer, startOffset);
  let pos = 0;
  element.childNodes.forEach((node) => {
    if(![1,3].includes(node.nodeType)) return
    if(node === startContainer){
      pos += startOffset;
    }else if(node.nodeType === 3){
      pos += node.textContent?.length || 0;
    }else{
      pos ++;
    }
  })
  console.log('pos', pos);
  const textContent = element.textContent || '';
  if(pos === textContent.length) {
    nextTick(() => {
      nextTick(() => selectionOnTail(element))
    })
    return textContent + (textContent.endsWith('\n') ? '\n' : '\n\n');
  }else{
    nextTick(() => {
      nextTick(() => {
        let p1 = 0;
        element.childNodes.forEach((node) => {
          if(![1,3].includes(node.nodeType)) return
          const len = node.nodeType === 3 ? node.textContent?.length || 0 : 1;
          if(p1 + len < pos) return

          const range = document.createRange();
          range.setStart(node, pos - p1 + 1);
          range.collapse(false); // false = collapse to end
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
        })
      })
    })
    return textContent.substring(0, pos) + '\n' + textContent.substring(pos);
  }
}
