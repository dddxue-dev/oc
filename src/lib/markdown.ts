/** 极简 Markdown 渲染（自包含，支持 [[词条内链]]） */

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export type WikiResolver = (title: string) => { href: string } | null

function inline(s: string, resolve?: WikiResolver): string {
  let t = escapeHtml(s)

  t = t.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_m, target: string, label?: string) => {
    const text = (label || target).trim()
    const hit = resolve?.(target.trim())
    if (hit) return `<a class="md-wiki" href="${hit.href}">${text}</a>`
    return `<span class="md-wiki" title="未找到词条：${target.trim()}">${text}</span>`
  })

  t = t.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer">$1</a>'
  )

  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  t = t.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>')
  return t
}

export function renderMarkdown(md: string, resolve?: WikiResolver): string {
  if (!md) return ''
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const out: string[] = []
  let listType: 'ul' | 'ol' | null = null
  let quote: string[] = []

  const closeList = () => {
    if (listType) {
      out.push(`</${listType}>`)
      listType = null
    }
  }
  const flushQuote = () => {
    if (quote.length) {
      out.push(`<blockquote>${quote.map((q) => `<p>${inline(q, resolve)}</p>`).join('')}</blockquote>`)
      quote = []
    }
  }

  for (const raw of lines) {
    const line = raw.trimEnd()

    if (/^>\s?/.test(line)) {
      closeList()
      quote.push(line.replace(/^>\s?/, ''))
      continue
    }
    flushQuote()

    if (!line.trim()) {
      closeList()
      continue
    }

    const h = /^(#{1,3})\s+(.*)$/.exec(line)
    if (h) {
      closeList()
      const lv = h[1].length
      out.push(`<h${lv}>${inline(h[2], resolve)}</h${lv}>`)
      continue
    }

    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      closeList()
      out.push('<hr/>')
      continue
    }

    const ul = /^[-*]\s+(.*)$/.exec(line)
    if (ul) {
      if (listType !== 'ul') {
        closeList()
        out.push('<ul>')
        listType = 'ul'
      }
      out.push(`<li>${inline(ul[1], resolve)}</li>`)
      continue
    }

    const ol = /^\d+[.)]\s+(.*)$/.exec(line)
    if (ol) {
      if (listType !== 'ol') {
        closeList()
        out.push('<ol>')
        listType = 'ol'
      }
      out.push(`<li>${inline(ol[1], resolve)}</li>`)
      continue
    }

    closeList()
    out.push(`<p>${inline(line, resolve)}</p>`)
  }

  closeList()
  flushQuote()
  return out.join('\n')
}

/** 取纯文本摘要 */
export function plainText(md: string, len = 120): string {
  const t = (md || '')
    .replace(/[#>*`\-]/g, ' ')
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, '$2$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
  return t.length > len ? t.slice(0, len) + '…' : t
}
