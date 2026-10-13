import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { renderMarkdown, type WikiResolver } from '@/lib/markdown'
import { avatarUrl } from '@/lib/placeholder'

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[22px] font-semibold leading-tight tracking-tight">
          {title}
        </h1>
        {subtitle ? (
          <div className="mt-1 text-[13px] text-muted">{subtitle}</div>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}

export function Empty({
  title,
  hint,
  action,
}: {
  title: string
  hint?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line px-6 py-16 text-center">
      <div className="mb-2 text-[15px] font-medium">{title}</div>
      {hint ? <div className="mb-4 max-w-md text-[13px] text-muted">{hint}</div> : null}
      {action}
    </div>
  )
}

export function Avatar({
  name,
  src,
  color,
  size = 36,
}: {
  name: string
  src?: string
  color?: string
  size?: number
}) {
  const url = src || avatarUrl(name, color)
  return (
    <img
      src={url}
      alt={name}
      width={size}
      height={size}
      className="shrink-0 rounded-full border border-line object-cover"
      style={{ width: size, height: size }}
    />
  )
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint ? <div className="mt-1 text-[11.5px] text-subtle">{hint}</div> : null}
    </div>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = 620,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  width?: number
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/35 p-4 py-10 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="card w-full shadow-none"
        style={{ maxWidth: width }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div className="text-[15px] font-medium">{title}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="关闭">
            <X size={15} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <div className="flex justify-end gap-2 border-t border-line px-5 py-3.5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function MarkdownView({
  text,
  resolve,
  className = '',
}: {
  text?: string
  resolve?: WikiResolver
  className?: string
}) {
  if (!text) return null
  return (
    <div
      className={`md ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(text, resolve) }}
    />
  )
}

export function Chips({
  items,
  accent,
}: {
  items: string[]
  accent?: boolean
}) {
  if (!items?.length) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <span key={t} className={accent ? 'chip chip-accent' : 'chip'}>
          {t}
        </span>
      ))}
    </div>
  )
}

export function KV({ k, v }: { k: string; v?: ReactNode }) {
  if (v === undefined || v === null || v === '') return null
  return (
    <div className="flex gap-3 py-1.5 text-[13px]">
      <div className="w-20 shrink-0 text-muted">{k}</div>
      <div className="min-w-0 flex-1 break-words">{v}</div>
    </div>
  )
}

export function Divider() {
  return <div className="my-4 h-px bg-line" />
}

export function StatCard({
  label,
  value,
  hint,
  onClick,
}: {
  label: string
  value: number | string
  hint?: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`card card-pad text-left ${onClick ? 'card-hover cursor-pointer' : 'cursor-default'}`}
    >
      <div className="text-[12px] text-muted">{label}</div>
      <div className="mt-1 text-[26px] font-semibold leading-none tracking-tight">
        {value}
      </div>
      {hint ? <div className="mt-1.5 text-[11.5px] text-subtle">{hint}</div> : null}
    </button>
  )
}
