import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  AlertTriangle,
  Check,
  Database,
  Download,
  Monitor,
  Moon,
  RefreshCw,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react'
import { db } from '@/lib/db'
import { downloadBackup, importBackup } from '@/lib/backup'
import { resetToSeed } from '@/lib/seed'
import { useSetting } from '@/lib/settings'
import { MODES, PRESETS, useTheme } from '@/lib/theme'
import { Field, Modal, PageHeader } from '@/components/ui'

export default function SettingsPage() {
  const { preset, mode, setPreset, setMode } = useTheme()
  const [worldName, setWorldName] = useSetting('worldName', '灰烬纪')
  const [worldIntro, setWorldIntro] = useSetting('worldIntro', '')

  const [name, setName] = useState(worldName)
  const [intro, setIntro] = useState(worldIntro)
  const [saved, setSaved] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmWipe, setConfirmWipe] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const counts = {
    characters: useLiveQuery(() => db.characters.count(), []) ?? 0,
    world: useLiveQuery(() => db.worldEntries.count(), []) ?? 0,
    events: useLiveQuery(() => db.events.count(), []) ?? 0,
    gallery: useLiveQuery(() => db.gallery.count(), []) ?? 0,
    stories: useLiveQuery(() => db.stories.count(), []) ?? 0,
    posts: useLiveQuery(() => db.posts.count(), []) ?? 0,
    relations: useLiveQuery(() => db.relations.count(), []) ?? 0,
  }

  const saveInfo = async () => {
    await setWorldName(name)
    await setWorldIntro(intro)
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  const doExport = async () => {
    setBusy(true)
    try {
      await downloadBackup()
      setMsg('备份已导出到下载目录。')
    } catch (e) {
      setMsg('导出失败：' + (e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const doImport = async (file: File, mode: 'replace' | 'merge') => {
    setBusy(true)
    try {
      const r = await importBackup(file, mode)
      setMsg(
        `导入完成：角色 ${r.characters}、词条 ${r.worldEntries}、事件 ${r.events}、画廊 ${r.gallery}、故事 ${r.stories}、帖子 ${r.posts}`
      )
    } catch (e) {
      setMsg('导入失败：' + (e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader title="设置" subtitle="站点信息、外观主题与数据备份" />

      {msg ? (
        <div className="card mb-5 flex items-start gap-2.5 border-accent/40 bg-accent-soft px-4 py-3 text-[12.5px] text-accent">
          <Check size={14} className="mt-0.5 shrink-0" />
          <span className="flex-1">{msg}</span>
          <button className="link" onClick={() => setMsg(null)}>
            知道了
          </button>
        </div>
      ) : null}

      <section id="site" className="card card-pad mb-5 scroll-mt-20">
        <h2 className="mb-1 text-[14px] font-medium">站点信息</h2>
        <p className="mb-4 text-[12px] text-muted">
          显示在总览页顶部的世界名与简介。
        </p>
        <div className="grid max-w-[640px] gap-3">
          <Field label="世界 / 站点名">
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="世界简介">
            <textarea
              className="textarea"
              rows={4}
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
            />
          </Field>
          <div>
            <button className="btn btn-primary" onClick={saveInfo}>
              {saved ? <Check size={14} /> : null}
              {saved ? '已保存' : '保存'}
            </button>
          </div>
        </div>
      </section>

      <section id="theme" className="card card-pad mb-5 scroll-mt-20">
        <h2 className="mb-1 text-[14px] font-medium">外观主题</h2>
        <p className="mb-4 text-[12px] text-muted">
          共 {PRESETS.length} 套低饱和配色，可随时切换，选择会记住。
        </p>

        <div className="mb-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPreset(p.id)}
              className={`flex items-center gap-3 rounded-[11px] border p-3 text-left transition-colors ${
                preset === p.id
                  ? 'border-accent bg-accent-soft'
                  : 'border-line hover:border-line-strong'
              }`}
            >
              <span className="flex shrink-0 overflow-hidden rounded-full border border-line">
                {p.swatch.map((c, i) => (
                  <span key={i} style={{ background: c }} className="h-8 w-3.5" />
                ))}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="text-[13px] font-medium">{p.name}</span>
                  {preset === p.id ? <Check size={12} className="text-accent" /> : null}
                </span>
                <span className="block truncate text-[11.5px] text-subtle">{p.desc}</span>
              </span>
            </button>
          ))}
        </div>

        <Field label="明暗模式">
          <div className="flex flex-wrap gap-2">
            {MODES.map((m) => {
              const Icon = m.id === 'light' ? Sun : m.id === 'dark' ? Moon : Monitor
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex items-center gap-2 rounded-[9px] border px-3 py-1.5 text-[12.5px] transition-colors ${
                    mode === m.id
                      ? 'border-accent bg-accent-soft text-accent'
                      : 'border-line text-muted hover:border-line-strong'
                  }`}
                >
                  <Icon size={13} />
                  {m.name}
                </button>
              )
            })}
          </div>
        </Field>
      </section>

      <section id="data" className="card card-pad mb-5 scroll-mt-20">
        <h2 className="mb-1 flex items-center gap-2 text-[14px] font-medium">
          <Database size={15} />
          数据与备份
        </h2>
        <p className="mb-4 text-[12px] leading-[1.8] text-muted">
          所有内容保存在<strong>当前浏览器的 IndexedDB</strong> 中，不会上传到任何服务器。
          清除浏览器数据、更换浏览器或使用隐私模式都会导致数据丢失，
          <strong className="text-fg">请定期导出备份</strong>。
        </p>

        <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
          {[
            ['角色', counts.characters],
            ['词条', counts.world],
            ['事件', counts.events],
            ['画作', counts.gallery],
            ['故事', counts.stories],
            ['帖子', counts.posts],
            ['关系', counts.relations],
          ].map(([k, v]) => (
            <div key={k as string} className="rounded-[10px] bg-sunken px-3 py-2.5">
              <div className="text-[11px] text-muted">{k}</div>
              <div className="text-[19px] font-semibold leading-tight">{v}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="btn btn-primary" onClick={doExport} disabled={busy}>
            <Download size={14} />
            导出 JSON 备份
          </button>
          <button
            className="btn"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
          >
            <Upload size={14} />
            导入备份（覆盖）
          </button>
          <button
            className="btn"
            onClick={() => setConfirmReset(true)}
            disabled={busy}
          >
            <RefreshCw size={14} />
            恢复示例数据
          </button>
          <button
            className="btn btn-danger"
            onClick={() => setConfirmWipe(true)}
            disabled={busy}
          >
            <Trash2 size={14} />
            清空全部数据
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) doImport(f, 'replace')
              e.target.value = ''
            }}
          />
        </div>

        <div className="mt-4 flex items-start gap-2.5 rounded-[10px] border border-line bg-sunken px-3.5 py-3 text-[12px] text-muted">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>
            导入「覆盖」会先清空现有数据再写入；如需合并，可在导入前先导出当前备份。
          </span>
        </div>
      </section>

      <section id="about" className="card card-pad scroll-mt-20">
        <h2 className="mb-2 text-[14px] font-medium">关于</h2>
        <p className="text-[12.5px] leading-[1.9] text-muted">
          OC Archive · 本地优先的原创角色记录站。
          <br />
          六个板块：总览 / 世界观（词条 + 时间线）/ 人物档案（档案 + 关系图）/ 论坛 / 画廊 /
          故事收录。
          <br />
          正文支持 Markdown，用 <code>[[词条名]]</code> 可跨条目内链。
        </p>
      </section>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="恢复示例数据"
        width={420}
        footer={
          <>
            <button className="btn" onClick={() => setConfirmReset(false)}>
              取消
            </button>
            <button
              className="btn btn-primary"
              onClick={async () => {
                setBusy(true)
                await resetToSeed()
                setBusy(false)
                setConfirmReset(false)
                setMsg('已恢复为内置示例数据。')
              }}
            >
              确认恢复
            </button>
          </>
        }
      >
        <p className="text-[13.5px] leading-[1.8]">
          这会<strong>清空现有全部数据</strong>，并重新写入内置的示例世界。
          <br />
          建议先导出备份。
        </p>
      </Modal>

      <Modal
        open={confirmWipe}
        onClose={() => setConfirmWipe(false)}
        title="清空全部数据"
        width={420}
        footer={
          <>
            <button className="btn" onClick={() => setConfirmWipe(false)}>
              取消
            </button>
            <button
              className="btn btn-danger"
              onClick={async () => {
                setBusy(true)
                await db.transaction(
                  'rw',
                  [
                    db.characters,
                    db.worldEntries,
                    db.events,
                    db.gallery,
                    db.stories,
                    db.boards,
                    db.posts,
                    db.relations,
                    db.nodePositions,
                  ],
                  async () => {
                    await Promise.all([
                      db.characters.clear(),
                      db.worldEntries.clear(),
                      db.events.clear(),
                      db.gallery.clear(),
                      db.stories.clear(),
                      db.boards.clear(),
                      db.posts.clear(),
                      db.relations.clear(),
                      db.nodePositions.clear(),
                    ])
                  }
                )
                setBusy(false)
                setConfirmWipe(false)
                setMsg('已清空全部数据。')
              }}
            >
              确认清空
            </button>
          </>
        }
      >
        <p className="text-[13.5px] leading-[1.8]">
          此操作<strong>不可撤销</strong>，将删除全部角色、词条、事件、画作、故事与帖子。
        </p>
      </Modal>
    </div>
  )
}
