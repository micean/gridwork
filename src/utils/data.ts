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
  target.fontBold = original.fontBold
  target.fontItalic = original.fontItalic
  target.fontThrough = original.fontThrough
  target.fontUnderline = original.fontUnderline
  target.flexDirection = original.flexDirection
  target.backgroundColor = original.backgroundColor
  target.headerFirstLine = original.headerFirstLine
  target.fontMist = original.fontMist
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
        cell.flexDirection = undefined
        cell.headerFirstLine = undefined
        cell.fontMist = undefined
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
  const div = document.createElement('div')
  const escapeHtml = (text: string): string => {
    div.textContent = text
    return div.innerHTML
  }

  const rows = gridData
    .map((row) => {
      return row
        .map((col) => {
          const tdClassNames = [!col.fontMist || 'mist'].filter(Boolean).join(' ');

          const codeStyle: Record<string, string> = {
            'font-size': col.fontSize ? `${col.fontSize}rem` : '',
            'font-weight': col.fontBold ? 'bold' : '',
            'font-style': col.fontItalic ? 'italic' : '',
            'text-decoration': [
              col.fontThrough ? 'line-through' : '',
              col.fontUnderline ? 'underline' : '',
            ]
              .filter(Boolean)
              .join(' '),
          }
          const codeStyleString = Object.keys(codeStyle)
            .map((k) => (codeStyle[k] ? `${k}: ${codeStyle[k]}` : ''))
            .filter(Boolean)
            .join(';')

          return `<td ${tdClassNames ? `class="${tdClassNames}"` : ''} ${col.backgroundColor ? `style="background-color: ${col.backgroundColor}"` : ''}>
            <code ${codeStyleString ? `style="${codeStyleString}"` : ''}>${escapeHtml(col.text)}</code>
            ${tablizeGrid(col.innerGrid || [])}
            </td>`
        })
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
      .map((elemTd) => elemTd as HTMLElement)
      .map((elemTd) => {
        const innerCodeElem = elemTd.querySelector(':scope>code') as HTMLElement
        const innerTableElem = elemTd.querySelector(':scope>table') as HTMLElement
        if (innerTableElem) elemTd.removeChild(innerTableElem)

        const id = nanoid()
        const text = elemTd.textContent?.trim() || ''
        const fontSize = elemTd.style.fontSize?.includes('rem')
          ? parseFloat(elemTd.style.fontSize.replace('rem', ''))
          : elemTd.style.fontSize?.includes('em')
            ? parseFloat(elemTd.style.fontSize.replace('rem', ''))
            : elemTd.style.fontSize?.includes('px')
              ? parseFloat(elemTd.style.fontSize.replace('px', '')) / 16
              : elemTd.style.fontSize?.includes('pt')
                ? (parseFloat(elemTd.style.fontSize.replace('pt', '')) * 96) / 72 / 16
                : undefined
        const fontBold =
          elemTd.style.fontWeight === 'bold' ||
          innerCodeElem?.style.fontWeight === 'bold' ||
          undefined
        const fontItalic =
          elemTd.style.fontStyle === 'italic' ||
          innerCodeElem?.style.fontStyle === 'italic' ||
          undefined
        const fontThrough =
          elemTd.style.textDecoration?.includes('line-through') ||
          innerCodeElem?.style.textDecoration?.includes('line-through') ||
          undefined
        const fontUnderline =
          elemTd.style.textDecoration?.includes('underline') ||
          innerCodeElem?.style.textDecoration?.includes('underline') ||
          undefined
        const backgroundColor = elemTd.style.backgroundColor || undefined
        const fontMist = elemTd.classList.contains('mist') || undefined
        const innerGrid = innerTableElem ? parseGrid(innerTableElem as HTMLElement) : undefined
        return {
          id,
          text,
          fontSize,
          fontBold,
          fontItalic,
          fontThrough,
          fontUnderline,
          backgroundColor,
          fontMist,
          innerGrid,
        } as CellData
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
