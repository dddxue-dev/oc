import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, now, uid } from '@/lib/db'
import { WORLD_CATEGORIES, type WorldEntry } from '@/lib/types'
import { Field, Modal } from './ui'

const EMPTY = {
  title: '',
  category: WORLD_CATEGORIES[0] as string,
  parentId: '',
  summary: '',
  content: '',
}

export default function WorldEntryEditor({
  open,
  onClose,
  initial,
}: {
  open: boolean
  onClose: () => void
  initial?: WorldEntry | null
}) {
  const [form, setForm] = useState({ ...EMPTY })
  const [tagText, setTagText] = useState('')
  const entries = useLiveQuery(() => db.worldEntries.toArray(), []) ?? []

  useEffect(() => {
    if (!open) return
    if (initial) {
      setForm({
        title: initial.title,
        category: initial.category,
        parentId: initial.parentId ?? '',
        summary: initial.summary ?? '',
        content: initial.content ?? '',
      })
      setTagText(initial.tags.join('、'))
    } else {
      setForm({ ...EMPTY })
      setTagText('')
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
    await db.worldEntries.put({
      id: initial?.id ?? uid(),
      title: form.title.trim(),
      category: form.category,
      parentId: form.parentId || undefined,
      summary: form.summary,
      content: form.content,
      tags,
      createdAt: initial?.createdAt ?? now(),
      updatedAt: now(),
    })
    onClose()
  }

  const parentOptions = entries.filter((e) => e.id !== initial?.id)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? '编辑词条' : '新建词条'}
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
        <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr]">
          <Field label="标题 *">
            <input
              className="input"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="如：灰烬海"
            />
          </Field>
          <Field label="分类">
            <select
              className="select"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
            >
              {WORLD_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="上级词条">
            <select
              className="select"
              value={form.parentId}
              onChange={(e) => set('parentId', e.target.value)}
            >
              <option value="">（无）</option>
              {parentOptions.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="摘要" hint="列表页显示的一句话简介">
          <textarea
            className="textarea"
            rows={2}
            value={form.summary}
            onChange={(e) => set('summary', e.target.value)}
          />
        </Field>

        <Field
          label="正文"
          hint="支持 Markdown：## 标题、**加粗**、- 列表、> 引用；用 [[词条名]] 可以内链到其他词条或角色"
        >
          <textarea
            className="textarea"
            rows={10}
            value={form.content}
            onChange={(e) => set('content', e.target.value)}
          />
        </Field>

        <Field label="标签" hint="用顿号或逗号分隔">
          <input
            className="input"
            value={tagText}
            onChange={(e) => setTagText(e.target.value)}
            placeholder="地理、灰烬海"
          />
        </Field>
      </div>
    </Modal>
  )
}
