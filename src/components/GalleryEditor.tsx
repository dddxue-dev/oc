import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ImagePlus, Wand2 } from 'lucide-react'
import { db, now, uid } from '@/lib/db'
import { artUrl } from '@/lib/placeholder'
import { GALLERY_CATEGORIES, type GalleryItem } from '@/lib/types'
import { Avatar, Field, Modal } from './ui'

const EMPTY = {
  title: '',
  image: '',
  artist: '',
  category: GALLERY_CATEGORIES[0] as string,
  description: '',
  date: '',
}

export default function GalleryEditor({
  open,
  onClose,
  initial,
}: {
  open: boolean
  onClose: () => void
  initial?: GalleryItem | null
}) {
  const [form, setForm] = useState({ ...EMPTY })
  const [tagText, setTagText] = useState('')
  const [charIds, setCharIds] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const characters = useLiveQuery(() => db.characters.toArray(), []) ?? []

  useEffect(() => {
    if (!open) return
    if (initial) {
      setForm({
        title: initial.title,
        image: initial.image,
        artist: initial.artist ?? '',
        category: initial.category ?? GALLERY_CATEGORIES[0],
        description: initial.description ?? '',
        date: initial.date ?? '',
      })
      setTagText(initial.tags.join('、'))
      setCharIds(initial.characterIds)
    } else {
      setForm({ ...EMPTY, date: new Date().toISOString().slice(0, 10) })
      setTagText('')
      setCharIds([])
    }
  }, [open, initial])

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const onPickFile = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => set('image', String(reader.result))
    reader.readAsDataURL(file)
  }

  const save = async () => {
    if (!form.title.trim()) return
    const tags = tagText
      .split(/[、,，\s]+/)
      .map((t) => t.trim())
      .filter(Boolean)
    await db.gallery.put({
      id: initial?.id ?? uid(),
      title: form.title.trim(),
      image: form.image || artUrl(Math.floor(Math.random() * 9999), form.title.trim()),
      artist: form.artist,
      category: form.category,
      description: form.description,
      characterIds: charIds,
      tags,
      date: form.date,
      createdAt: initial?.createdAt ?? now(),
    })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? '编辑作品' : '新建作品'}
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
        <div className="flex gap-4">
          <div className="flex w-[150px] shrink-0 flex-col gap-2">
            <div className="overflow-hidden rounded-[10px] border border-line bg-sunken">
              {form.image ? (
                <img src={form.image} alt="" className="h-[170px] w-full object-cover" />
              ) : (
                <div className="flex h-[170px] items-center justify-center text-[12px] text-subtle">
                  未选择图片
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
                onClick={() =>
                  set('image', artUrl(Math.floor(Math.random() * 9999), form.title))
                }
                title="生成占位图"
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
            <Field label="作品标题 *">
              <input
                className="input"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="画师">
                <input
                  className="input"
                  value={form.artist}
                  onChange={(e) => set('artist', e.target.value)}
                  placeholder="self / 委托画师"
                />
              </Field>
              <Field label="分类">
                <select
                  className="select"
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                >
                  {GALLERY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="日期">
              <input
                className="input"
                type="date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
              />
            </Field>
          </div>
        </div>

        <Field label="描述">
          <textarea
            className="textarea"
            rows={3}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </Field>

        <Field label="关联角色">
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
            placeholder="立绘、主角"
          />
        </Field>
      </div>
    </Modal>
  )
}
