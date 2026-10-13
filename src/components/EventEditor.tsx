import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, now, uid } from '@/lib/db'
import type { EventItem } from '@/lib/types'
import { Avatar, Field, Modal } from './ui'

const EMPTY = {
  title: '',
  era: '',
  year: 0,
  endYear: undefined as number | undefined,
  summary: '',
  content: '',
  location: '',
}

export default function EventEditor({
  open,
  onClose,
  initial,
}: {
  open: boolean
  onClose: () => void
  initial?: EventItem | null
}) {
  const [form, setForm] = useState({ ...EMPTY })
  const [tagText, setTagText] = useState('')
  const [charIds, setCharIds] = useState<string[]>([])
  const characters = useLiveQuery(() => db.characters.toArray(), []) ?? []
  const existing = useLiveQuery(() => db.events.toArray(), []) ?? []

  const eras = Array.from(new Set(existing.map((e) => e.era).filter(Boolean))) as string[]

  useEffect(() => {
    if (!open) return
    if (initial) {
      setForm({
        title: initial.title,
        era: initial.era ?? '',
        year: initial.year,
        endYear: initial.endYear,
        summary: initial.summary ?? '',
        content: initial.content ?? '',
        location: initial.location ?? '',
      })
      setTagText(initial.tags.join('、'))
      setCharIds(initial.characterIds)
    } else {
      setForm({ ...EMPTY })
      setTagText('')
      setCharIds([])
    }
  }, [open, initial])

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.title.trim()) return
    const tags = tagText
      .split(/[、,，\s]+/)
      .map((t) => t.trim())
      .filter(Boolean)
    await db.events.put({
      id: initial?.id ?? uid(),
      title: form.title.trim(),
      era: form.era || undefined,
      year: Number(form.year) || 0,
      endYear:
        form.endYear === undefined || Number.isNaN(Number(form.endYear))
          ? undefined
          : Number(form.endYear),
      summary: form.summary,
      content: form.content,
      location: form.location,
      characterIds: charIds,
      tags,
      createdAt: initial?.createdAt ?? now(),
      updatedAt: now(),
    })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? '编辑事件' : '新建事件'}
      width={700}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            取消
          </button>
          <button className="btn btn-primary" onClick={save} disabled={!form.title.trim()}>
            保存
          </button>
        </>
      }
    >
      <div className="grid gap-4">
        <Field label="事件标题 *">
          <input
            className="input"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="如：灰烬海战役"
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="纪年" hint="留空则归入「未纪年」">
            <input
              className="input"
              list="era-options"
              value={form.era}
              onChange={(e) => set('era', e.target.value)}
              placeholder="长夜历"
            />
            <datalist id="era-options">
              {eras.map((e) => (
                <option key={e} value={e} />
              ))}
            </datalist>
          </Field>
          <Field label="年份" hint="支持负数（纪元之前）">
            <input
              className="input"
              type="number"
              value={form.year}
              onChange={(e) => set('year', Number(e.target.value))}
            />
          </Field>
          <Field label="结束年份" hint="留空表示瞬时事件">
            <input
              className="input"
              type="number"
              value={form.endYear ?? ''}
              onChange={(e) =>
                set('endYear', e.target.value === '' ? undefined : Number(e.target.value))
              }
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="发生地点">
            <input
              className="input"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
            />
          </Field>
          <Field label="标签" hint="顿号或逗号分隔">
            <input
              className="input"
              value={tagText}
              onChange={(e) => setTagText(e.target.value)}
              placeholder="战役、转折点"
            />
          </Field>
        </div>

        <Field label="摘要">
          <textarea
            className="textarea"
            rows={2}
            value={form.summary}
            onChange={(e) => set('summary', e.target.value)}
          />
        </Field>

        <Field label="详情" hint="支持 Markdown">
          <textarea
            className="textarea"
            rows={6}
            value={form.content}
            onChange={(e) => set('content', e.target.value)}
          />
        </Field>

        <Field label="参与角色">
          {characters.length === 0 ? (
            <p className="text-[12.5px] text-muted">还没有角色档案。</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {characters.map((c) => {
                const on = charIds.includes(c.id)
                return (
                  <button
                    key={c.id}
                    onClick={() =>
                      setCharIds((prev) =>
                        on ? prev.filter((x) => x !== c.id) : [...prev, c.id]
                      )
                    }
                    className={`flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-2.5 text-[12px] transition-colors ${
                      on ? 'border-accent bg-accent-soft text-accent' : 'border-line text-muted'
                    }`}
                  >
                    <Avatar name={c.name} src={c.avatar} color={c.color} size={20} />
                    {c.name}
                  </button>
                )
              })}
            </div>
          )}
        </Field>
      </div>
    </Modal>
  )
}
