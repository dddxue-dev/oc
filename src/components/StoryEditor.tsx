import { useEffect, useMemo, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ImagePlus, Wand2 } from 'lucide-react'
import { db, now, uid } from '@/lib/db'
import { artUrl } from '@/lib/placeholder'
import { STORY_STATUS, type Story } from '@/lib/types'
import { Avatar, Field, Modal } from './ui'

const EMPTY = {
  title: '',
  cover: '',
  summary: '',
  content: '',
  status: STORY_STATUS[0] as string,
  worldId: '',
}

export default function StoryEditor({
  open,
  onClose,
  initial,
}: {
  open: boolean
  onClose: () => void
  initial?: Story | null
}) {
  const [form, setForm] = useState({ ...EMPTY })
  const [tagText, setTagText] = useState('')
  const [charIds, setCharIds] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const characters = useLiveQuery(() => db.characters.toArray(), []) ?? []
  const worldEntries = useLiveQuery(() => db.worldEntries.toArray(), []) ?? []

  /** 世界观词条按层级展开成下拉选项，前缀缩进体现父子关系 */
  const worldOptions = useMemo(() => {
    const byParent = new Map<string, typeof worldEntries>()
    worldEntries.forEach((w) => {
      const k = w.parentId ?? ''
      const arr = byParent.get(k)
      if (arr) arr.push(w)
      else byParent.set(k, [w])
    })
    const out: { id: string; label: string }[] = []
    const walk = (parent: string, depth: number) => {
      const kids = (byParent.get(parent) ?? []).sort((a, b) =>
        a.title.localeCompare(b.title, 'zh')
      )
      kids.forEach((w) => {
        out.push({
          id: w.id,
          label: `${'　'.repeat(depth)}${depth ? '└ ' : ''}${w.title}（${w.category}）`,
        })
        walk(w.id, depth + 1)
      })
    }
    walk('', 0)
    return out
  }, [worldEntries])

  useEffect(() => {
    if (!open) return
    if (initial) {
      setForm({
        title: initial.title,
        cover: initial.cover ?? '',
        summary: initial.summary ?? '',
        content: initial.content ?? '',
        status: initial.status ?? STORY_STATUS[0],
        worldId: initial.worldId ?? '',
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

  const onPickFile = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => set('cover', String(reader.result))
    reader.readAsDataURL(file)
  }

  const save = async () => {
    if (!form.title.trim()) return
    const tags = tagText
      .split(/[、,，\s]+/)
      .map((t) => t.trim())
      .filter(Boolean)
    await db.stories.put({
      id: initial?.id ?? uid(),
      title: form.title.trim(),
      cover: form.cover || artUrl(Math.floor(Math.random() * 9999), '', 600, 340),
      summary: form.summary,
      content: form.content,
      status: form.status,
      worldId: form.worldId || undefined,
      tags,
      characterIds: charIds,
      createdAt: initial?.createdAt ?? now(),
      updatedAt: now(),
    })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? '编辑故事' : '新建故事'}
      width={760}
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
        <div className="flex gap-4">
          <div className="flex w-[180px] shrink-0 flex-col gap-2">
            <div className="overflow-hidden rounded-[10px] border border-line bg-sunken">
              {form.cover ? (
                <img src={form.cover} alt="" className="h-[100px] w-full object-cover" />
              ) : (
                <div className="flex h-[100px] items-center justify-center text-[12px] text-subtle">
                  未选择封面
                </div>
              )}
            </div>
            <div className="flex gap-1.5">
              <button className="btn btn-sm flex-1" onClick={() => fileRef.current?.click()}>
                <ImagePlus size={13} />
                上传
              </button>
              <button
                className="btn btn-sm flex-1"
                onClick={() => set('cover', artUrl(Math.floor(Math.random() * 9999), '', 600, 340))}
              >
                <Wand2 size={13} />
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => onPickFile(e.target.files?.[0])}
            />
          </div>

          <div className="grid flex-1 gap-3">
            <Field label="故事标题 *">
              <input
                className="input"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
              />
            </Field>
            <Field label="状态">
              <select
                className="select"
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
              >
                {STORY_STATUS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="摘要">
              <textarea
                className="textarea"
                rows={2}
                value={form.summary}
                onChange={(e) => set('summary', e.target.value)}
              />
            </Field>
          </div>
        </div>

        <Field label="世界观" hint="这条故事归属的世界观词条">
          <select
            className="select"
            value={form.worldId}
            onChange={(e) => set('worldId', e.target.value)}
          >
            <option value="">（不关联）</option>
            {worldOptions.map((w) => (
              <option key={w.id} value={w.id}>
                {w.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="正文" hint="支持 Markdown：## 章节、**加粗**、> 引用、- 列表">
          <textarea
            className="textarea"
            rows={12}
            value={form.content}
            onChange={(e) => set('content', e.target.value)}
            placeholder={'## 一\n\n正文……'}
          />
        </Field>

        <Field label="出场角色">
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

        <Field label="标签" hint="顿号或逗号分隔">
          <input
            className="input"
            value={tagText}
            onChange={(e) => setTagText(e.target.value)}
            placeholder="主线、短篇"
          />
        </Field>
      </div>
    </Modal>
  )
}
