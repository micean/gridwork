import type { CellData } from '../../env'
import { customAlphabet } from 'nanoid'

type PathString = string // format like: [0,1]>[2,3]>[4,5]
type PathNumber = [number, number][]

export const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 8)

export const createGridData = (rows: number, cols: number): CellData[][] => {
  return new Array(rows).fill(0).map(() => createRowData(cols))
}
export const createRowData = (cols: number): CellData[] => {
  return new Array(cols).fill(0).map(() => {
    return createCellData()
  })
}
export const createCellData = (): CellData => {
  return {
    id: nanoid(),
    text: '',
  }
}
export const copyCellData = (original: CellData, target: CellData) => {
  target.id = original.id
  target.text = original.text
  target.fontSize = original.fontSize
  target.fontItalic = original.fontItalic
  target.fontThrough = original.fontThrough
  target.fontUnderline = original.fontUnderline
  target.flexDirection = original.flexDirection
  target.backgroundColor = original.backgroundColor
  target.innerGrid = original.innerGrid
  return target
}
export const lookupCellData = (gridData: CellData[][], parts: PathString | PathNumber) => {
  if (!parts.length) {
    return null
  }
  if (typeof parts === 'string') {
    parts = parts.split('>').map((it) => JSON.parse(it))
  }
  return parts.reduce(
    (acc, cur) => {
      const [row, col] = cur
      const it = acc.innerGrid![row][col]
      return it
    },
    { text: '', innerGrid: gridData } as CellData,
  )
}
export const lookupInnerGrid = (gridData: CellData[][], parts: PathString | PathNumber) => {
  if (!parts.length) {
    return gridData
  }
  if (typeof parts === 'string') {
    parts = parts.split('>').map((it) => JSON.parse(it))
  }
  return parts.reduce((acc, cur) => {
    const [row, col] = cur
    const it = acc[row][col]
    return it.innerGrid || []
  }, gridData)
}
export const tryLookupInnerGrid = (gridData: CellData[][], parts: PathString | PathNumber) => {
  if (!parts.length) {
    return { realGridData: gridData, realParts: [] }
  }
  if (typeof parts === 'string') {
    parts = parts.split('>').map((it) => JSON.parse(it))
  }
  const realParts = [] as [number, number][]
  const realGridData = parts.reduce((acc, cur) => {
    const [row, col] = cur
    if (acc[row] && acc[row][col]) {
      realParts.push(cur)
    }
    const it = acc[row][col]
    return it.innerGrid || []
  }, gridData)
  return { realGridData, realParts }
}

/**
 * 递归更新单元格及其所有嵌套单元格的字体大小
 * @param cell 要更新的单元格
 * @param fontSize 新的字体大小，可以是undefined表示重置为默认
 */
export const updateCellFontSizeRecursive = (cell: CellData, fontSize: number | undefined) => {
  // 更新当前单元格的字体大小
  cell.fontSize = fontSize

  // 如果有嵌套表格，递归更新所有嵌套单元格
  if (cell.innerGrid && cell.innerGrid.length > 0) {
    cell.innerGrid.forEach((row) => {
      row.forEach((nestedCell) => {
        updateCellFontSizeRecursive(nestedCell, fontSize)
      })
    })
  }
}

export const pickGridData = (
  gridData: CellData[][],
  paths: PathString[] | PathNumber[],
  clipText = true,
) => {
  if (!paths.length) {
    return []
  }
  if (!gridData.length) {
    return []
  }
  return paths
    .map((it) => {
      if (typeof it === 'string') {
        return it.split('>').map((it2) => JSON.parse(it2) as [number, number])
      }
      return it
    })
    .map((it) => {
      const pos = it[it.length - 1]
      const cell = lookupCellData(gridData, it)!
      const data = JSON.parse(JSON.stringify(cell))
      if (clipText) {
        cell.text = ''
        cell.innerGrid = undefined
        cell.fontSize = undefined
        cell.flexDirection = undefined
        cell.fontItalic = undefined
        cell.fontThrough = undefined
        cell.fontUnderline = undefined
        cell.backgroundColor = undefined
      }
      return { pos, data }
    })
    .reduce((acc, cur) => {
      const [row, col] = cur.pos
      acc[row] = acc[row] || []
      acc[row][col] = JSON.parse(JSON.stringify(cur.data))
      return acc
    }, [] as CellData[][])
    .filter((it) => it && it.length)
    .map((it) => {
      return it.filter(Boolean)
    })
}
export const stringifyCell = (cell: CellData, noWrap = false, depth: number = 0) => {
  let inner = ''
  const wrap = noWrap ? '' : '\n'
  if (cell.innerGrid) {
    inner = cell.innerGrid
      .map((row) => {
        return row
          .map((cell) => {
            return stringifyCell(cell, true, depth + 1)
          })
          .join('\t')
      })
      .map(
        (row) =>
          Array(depth + 1)
            .fill('\t')
            .join('') + row,
      )
      .join(wrap)
  }
  return (noWrap ? cell.text.replace(/\r?\n/g, ' ') : cell.text) + (inner ? wrap + inner : '')
}

export const tablizeGrid = (gridData: CellData[][]): string => {
  if (!gridData.length) return ''
  const div = document.createElement('div');
  const escapeHtml = (text: string): string => {
    div.textContent = text;
    return div.innerHTML;
  }

  const rows = gridData
    .map((row) => {
      return row
        .map(
          (col) =>
            `<td ${col.backgroundColor ? `style="background-color: ${col.backgroundColor}"` : ''}>
       <code ${col.fontSize ? `style="font-size: ${col.fontSize}rem"` : ''}>${escapeHtml(col.text)}</code>
       ${tablizeGrid(col.innerGrid || [])}
       </td>`,
        )
        .join('')
    })
    .map((row) => {
      return `<tr>${row}</tr>`
    })
    .join('')
  return `<table><tbody>${rows}</tbody></table>`
}
export const parseGrid = (html: string | HTMLElement): CellData[][] | undefined => {
  if (typeof html === 'string') {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const table = doc.querySelector('table')
    if (!table) {
      return undefined
    }
    html = table
  }
  const table = html as HTMLElement
  const rows = table.querySelectorAll(':scope>tbody>tr')
  const grid = Array.from(rows).map((row) => {
    const tds = row.querySelectorAll(':scope>td, :scope>th')
    const cells = Array.from(tds)
      .map((elem) => elem as HTMLElement)
      .map((elem) => {
        const innerTableElem = elem.querySelector(':scope>table')
        if (innerTableElem) elem.removeChild(innerTableElem)

        const id = nanoid()
        const text = elem.textContent?.trim() || ''
        const fontSize = elem.style.fontSize?.includes('rem') ? parseFloat(elem.style.fontSize.replace('rem', '')) :
          elem.style.fontSize?.includes('em') ? parseFloat(elem.style.fontSize.replace('rem', '')) :
          elem.style.fontSize?.includes('px') ? parseFloat(elem.style.fontSize.replace('px', '')) / 16 :
          elem.style.fontSize?.includes('pt') ? parseFloat(elem.style.fontSize.replace('pt', '')) * 96 / 72 / 16 : undefined
        const fontBold = elem.style.fontWeight === 'bold' || undefined
        const fontItalic = elem.style.fontStyle === 'italic' || undefined
        const fontThrough = elem.style.textDecoration?.includes('line-through') || undefined
        const fontUnderline = elem.style.textDecoration?.includes('underline') || undefined
        const backgroundColor = elem.style.backgroundColor || undefined
        const innerGrid = innerTableElem ? parseGrid(innerTableElem as HTMLElement) : undefined
        return { id, text, fontSize, fontBold, fontItalic, fontThrough, fontUnderline, backgroundColor, innerGrid }
      })
    return cells
  })
  return grid
}
export const changeGridFontSize = (cell: CellData, delta: number) => {
  const currentFontSize = cell.fontSize || 0.8
  const newFontSize = Math.max(0.4, Math.min(1.5, currentFontSize + delta))
  cell.fontSize = newFontSize
  cell.innerGrid?.flatMap((row) => row).map((col) => changeGridFontSize(col, delta))
}
