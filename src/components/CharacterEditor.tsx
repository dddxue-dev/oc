import { useEffect, useRef, useState } from 'react'
import { ImagePlus, RefreshCw } from 'lucide-react'
import { db, now, uid } from '@/lib/db'
import { PALETTE, avatarUrl, pickColor } from '@/lib/placeholder'
import type { Character } from '@/lib/types'
import { Avatar, Field, Modal } from './ui'

const EMPTY: Omit<Character, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  alias: '',
  avatar: '',
  color: PALETTE[0],
  gender: '',
  age: '',
  species: '',
  affiliation: '',
  status: '',
  appearance: '',
  personality: '',
  abilities: '',
  goals: '',
  quote: '',
  backstory: '',
  tags: [],
}

export default function CharacterEditor({
  open,
  onClose,
  initial,
}: {
  open: boolean
  onClose: () => void
  initial?: Character | null
}) {
  const [form, setForm] = useState({ ...EMPTY })
  const [tagText, setTagText] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    if (initial) {
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = initial
      setForm({ ...EMPTY, ...rest })
      setTagText(initial.tags.join('、'))
    } else {
      setForm({ ...EMPTY, color: PALETTE[Math.floor(Math.random() * PALETTE.length)] })
      setTagText('')
    }
  }, [open, initial])

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const onPickFile = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => set('avatar', String(reader.result))
    reader.readAsDataURL(file)
  }

  const save = async () => {
    if (!form.name.trim()) return
    const tags = tagText
      .split(/[、,，\s]+/)
      .map((t) => t.trim())
      .filter(Boolean)
    const payload: Character = {
      ...form,
      name: form.name.trim(),
      tags,
      id: initial?.id ?? uid(),
      createdAt: initial?.createdAt ?? now(),
      updatedAt: now(),
      avatar: form.avatar || avatarUrl(form.name.trim(), form.color),
    }
    await db.characters.put(payload)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? '编辑角色档案' : '新建角色档案'}
      width={720}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            取消
          </button>
          <button className="btn btn-primary" onClick={save} disabled={!form.name.trim()}>
            保存
          </button>
        </>
      }
    >
      <div className="grid gap-4">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-2">
            <Avatar name={form.name || '?'} src={form.avatar} color={form.color} size={72} />
            <div className="flex gap-1.5">
              <button
                className="btn btn-sm"
                onClick={() => fileRef.current?.click()}
                title="上传头像"
              >
                <ImagePlus size={13} />
              </button>
              <button
                className="btn btn-sm"
                onClick={() => set('avatar', '')}
                title="恢复为首字头像"
              >
                <RefreshCw size={13} />
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

          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            <Field label="姓名 *">
              <input
                className="input"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="角色名"
              />
            </Field>
            <Field label="代称 / 称号">
              <input
                className="input"
                value={form.alias}
                onChange={(e) => set('alias', e.target.value)}
                placeholder="如：观测者"
              />
            </Field>
            <Field label="代表色">
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    onClick={() => set('color', c)}
                    className={`h-6 w-6 rounded-full border transition-transform ${
                      form.color === c
                        ? 'border-fg scale-110'
                        : 'border-line hover:scale-105'
                    }`}
                    style={{ background: c }}
                    aria-label={c}
                  />
                ))}
              </div>
            </Field>
            <Field label="状态">
              <input
                className="input"
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                placeholder="如：活动 / 潜伏 / 已故"
              />
            </Field>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <Field label="性别">
            <input
              className="input"
              value={form.gender}
              onChange={(e) => set('gender', e.target.value)}
            />
          </Field>
          <Field label="年龄">
            <input
              className="input"
              value={form.age}
              onChange={(e) => set('age', e.target.value)}
            />
          </Field>
          <Field label="种族">
            <input
              className="input"
              value={form.species}
              onChange={(e) => set('species', e.target.value)}
            />
          </Field>
          <Field label="所属组织">
            <input
              className="input"
              value={form.affiliation}
              onChange={(e) => set('affiliation', e.target.value)}
            />
          </Field>
        </div>

        <Field label="外貌">
          <textarea
            className="textarea"
            rows={2}
            value={form.appearance}
            onChange={(e) => set('appearance', e.target.value)}
            placeholder="体型、发色、穿着、标志性特征…"
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="性格">
            <textarea
              className="textarea"
              rows={3}
              value={form.personality}
              onChange={(e) => set('personality', e.target.value)}
            />
          </Field>
          <Field label="能力 / 技能">
            <textarea
              className="textarea"
              rows={3}
              value={form.abilities}
              onChange={(e) => set('abilities', e.target.value)}
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="目标 / 执念">
            <textarea
              className="textarea"
              rows={2}
              value={form.goals}
              onChange={(e) => set('goals', e.target.value)}
            />
          </Field>
          <Field label="代表台词">
            <textarea
              className="textarea"
              rows={2}
              value={form.quote}
              onChange={(e) => set('quote', e.target.value)}
              placeholder="用引号包起来更醒目"
            />
          </Field>
        </div>

        <Field label="背景故事" hint="支持 Markdown：## 标题、**加粗**、- 列表、> 引用">
          <textarea
            className="textarea"
            rows={6}
            value={form.backstory}
            onChange={(e) => set('backstory', e.target.value)}
          />
        </Field>

        <Field label="标签" hint="用顿号或逗号分隔，例如：主角、共鸣术">
          <input
            className="input"
            value={tagText}
            onChange={(e) => setTagText(e.target.value)}
            placeholder="主角、观测者、共鸣术"
          />
        </Field>
      </div>
    </Modal>
  )
}
