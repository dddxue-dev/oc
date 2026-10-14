import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { LayoutGrid, Link2, Plus, Trash2 } from 'lucide-react'
import { db, now, uid } from '@/lib/db'
import { useWorldId } from '@/lib/world'
import type { Character, Relation } from '@/lib/types'
import { RELATION_PRESETS } from '@/lib/types'
import { avatarUrl } from '@/lib/placeholder'
import { Empty, Field, Modal, PageHeader } from '@/components/ui'

const HANDLE_CLS = '!h-2 !w-2 !border-0'

function CharNode({ data, selected }: NodeProps) {
  const c = (data as { character: Character }).character
  return (
    <div
      className={`flex items-center gap-2 rounded-[10px] border bg-surface px-2.5 py-1.5 ${
        selected ? 'border-accent' : 'border-line'
      }`}
      style={{ minWidth: 132 }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className={`${HANDLE_CLS} !bg-line-strong`}
      />
      <Handle
        type="target"
        position={Position.Left}
        className={`${HANDLE_CLS} !bg-line-strong`}
      />
      <img
        src={c.avatar || avatarUrl(c.name, c.color)}
        alt=""
        className="h-7 w-7 shrink-0 rounded-full border border-line object-cover"
      />
      <div className="min-w-0 leading-tight">
        <div className="truncate text-[12.5px] font-medium">{c.name}</div>
        {c.alias ? (
          <div className="truncate text-[10.5px] text-subtle">{c.alias}</div>
        ) : null}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className={`${HANDLE_CLS} !bg-accent`}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={`${HANDLE_CLS} !bg-accent`}
      />
    </div>
  )
}

const nodeTypes = { char: CharNode }

function GraphInner() {
  const worldId = useWorldId()
  const characters =
    useLiveQuery(
      () => db.characters.where('worldId').equals(worldId).toArray(),
      [worldId]
    ) ?? []
  const relations =
    useLiveQuery(() => db.relations.where('worldId').equals(worldId).toArray(), [
      worldId,
    ]) ?? []
  const positions =
    useLiveQuery(
      () => db.nodePositions.where('worldId').equals(worldId).toArray(),
      [worldId]
    ) ?? []

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [pending, setPending] = useState<Connection | null>(null)
  const [label, setLabel] = useState<string>(RELATION_PRESETS[0])
  const [customLabel, setCustomLabel] = useState('')
  const [editEdge, setEditEdge] = useState<Edge | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const { fitView } = useReactFlow()

  const signature =
    characters.map((c) => c.id).join(',') +
    '#' +
    relations.map((r) => r.id + r.label).join(',') +
    '#' +
    positions.map((p) => `${p.id}:${p.x},${p.y}`).join(';')

  useEffect(() => {
    const posMap = new Map(positions.map((p) => [p.id, p]))
    const valid = new Set(characters.map((c) => c.id))

    const auto = (i: number, total: number) => {
      const r = Math.max(220, total * 34)
      const a = (i / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2
      return { x: 420 + Math.cos(a) * r, y: 300 + Math.sin(a) * r }
    }

    setNodes(
      characters.map((c, i) => {
        const p = posMap.get(c.id)
        return {
          id: c.id,
          type: 'char',
          position: p ? { x: p.x, y: p.y } : auto(i, characters.length),
          data: { character: c },
        } as Node
      })
    )

    setEdges(
      relations
        .filter((r) => valid.has(r.source) && valid.has(r.target))
        .map((r) => ({
          id: r.id,
          source: r.source,
          target: r.target,
          label: r.label,
          type: 'smoothstep',
          style: { strokeWidth: 1.2 },
          labelStyle: { fontSize: 11 },
          labelBgPadding: [5, 2] as [number, number],
          labelBgBorderRadius: 4,
          markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14 },
        }))
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature])

  const onNodeDragStop = useCallback(
    (_: unknown, node: Node) => {
      void db.nodePositions.put({
        id: node.id,
        worldId,
        x: node.position.x,
        y: node.position.y,
      })
    },
    [worldId]
  )

  const onConnect = useCallback((conn: Connection) => {
    if (!conn.source || !conn.target || conn.source === conn.target) return
    setLabel(RELATION_PRESETS[0])
    setCustomLabel('')
    setPending(conn)
  }, [])

  const confirmConnect = async () => {
    if (!pending?.source || !pending?.target) return
    const final = customLabel.trim() || label
    const exists = relations.some(
      (r) => r.source === pending.source && r.target === pending.target
    )
    if (exists) {
      setPending(null)
      return
    }
    const rel: Relation = {
      id: uid(),
      worldId,
      source: pending.source,
      target: pending.target,
      label: final,
    }
    await db.relations.put(rel)
    setPending(null)
  }

  const removeEdge = async (id: string) => {
    await db.relations.delete(id)
    setEditEdge(null)
  }

  const resetLayout = async () => {
    const total = characters.length
    const r = Math.max(220, total * 34)
    await db.transaction('rw', db.nodePositions, async () => {
      await db.nodePositions.where('worldId').equals(worldId).delete()
      await Promise.all(
        characters.map((c, i) => {
          const a = (i / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2
          return db.nodePositions.put({
            id: c.id,
            worldId,
            x: 420 + Math.cos(a) * r,
            y: 300 + Math.sin(a) * r,
          })
        })
      )
    })
    setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 60)
  }

  const nameOf = useMemo(
    () => new Map(characters.map((c) => [c.id, c.name])),
    [characters]
  )

  if (characters.length === 0) {
    return (
      <>
        <Empty
          title="还没有角色"
          hint="先建几个角色档案，再回来连线。"
          action={
            <Link to="/characters" className="btn btn-primary">
              去建角色
            </Link>
          }
        />
      </>
    )
  }

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-[12.5px] text-muted">
        <span className="flex items-center gap-1.5">
          <Link2 size={13} />
          从节点边缘的圆点拖到另一个节点即可连线
        </span>
        <span className="text-subtle">·</span>
        <span>拖动节点会自动保存位置</span>
        <div className="flex-1" />
        <button className="btn btn-sm" onClick={resetLayout}>
          <LayoutGrid size={13} />
          环形排列
        </button>
        <button
          className="btn btn-sm"
          onClick={() => fitView({ padding: 0.2, duration: 400 })}
        >
          适应视图
        </button>
      </div>

      <div
        className="card overflow-hidden"
        style={{ height: 'min(70vh, 640px)' }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={onNodeDragStop}
          onConnect={onConnect}
          onEdgeClick={(_, e) => {
            const rel = relations.find((r) => r.id === e.id)
            setEditLabel(rel?.label ?? '')
            setEditEdge(e)
          }}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.25}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={18} size={1} />
          <Controls showInteractive={false} />
          <MiniMap
            pannable
            zoomable
            nodeStrokeWidth={2}
            style={{ width: 120, height: 84 }}
          />
        </ReactFlow>
      </div>

      <section className="card card-pad mt-4">
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="text-[13.5px] font-medium">关系清单</h2>
          <span className="text-[11.5px] text-subtle">{relations.length} 条</span>
        </div>
        {relations.length === 0 ? (
          <p className="text-[12.5px] text-muted">还没有连线。</p>
        ) : (
          <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {relations.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-2 rounded-[8px] border border-line px-2.5 py-1.5 text-[12px]"
              >
                <span className="min-w-0 flex-1 truncate">
                  {nameOf.get(r.source) ?? '?'}
                  <span className="mx-1.5 text-subtle">→</span>
                  {nameOf.get(r.target) ?? '?'}
                </span>
                <span className="chip shrink-0">{r.label}</span>
                <button
                  className="btn btn-ghost btn-sm shrink-0"
                  onClick={() => removeEdge(r.id)}
                  title="删除"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 新建连线 */}
      <Modal
        open={!!pending}
        onClose={() => setPending(null)}
        title="建立关系"
        width={440}
        footer={
          <>
            <button className="btn" onClick={() => setPending(null)}>
              取消
            </button>
            <button className="btn btn-primary" onClick={confirmConnect}>
              保存关系
            </button>
          </>
        }
      >
        <div className="mb-3 text-[13px] text-muted">
          {pending ? nameOf.get(pending.source) : ''}
          <span className="mx-2 text-subtle">→</span>
          {pending ? nameOf.get(pending.target) : ''}
        </div>
        <Field label="关系类型">
          <div className="flex flex-wrap gap-1.5">
            {RELATION_PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setLabel(p)
                  setCustomLabel('')
                }}
                className={label === p && !customLabel ? 'chip chip-accent' : 'chip'}
              >
                {p}
              </button>
            ))}
          </div>
        </Field>
        <div className="mt-3">
          <Field label="自定义描述" hint="填写后优先于上面选择的类型">
            <input
              className="input"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="如：欠他一条命"
            />
          </Field>
        </div>
      </Modal>

      {/* 编辑连线 */}
      <Modal
        open={!!editEdge}
        onClose={() => setEditEdge(null)}
        title="编辑关系"
        width={420}
        footer={
          <>
            <button
              className="btn btn-danger"
              onClick={() => editEdge && removeEdge(editEdge.id)}
            >
              <Trash2 size={13} />
              删除
            </button>
            <div className="flex-1" />
            <button className="btn" onClick={() => setEditEdge(null)}>
              取消
            </button>
            <button
              className="btn btn-primary"
              onClick={async () => {
                if (editEdge && editLabel.trim()) {
                  await db.relations.update(editEdge.id, {
                    label: editLabel.trim(),
                  })
                }
                setEditEdge(null)
              }}
            >
              保存
            </button>
          </>
        }
      >
        <Field label="关系描述">
          <input
            className="input"
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
          />
        </Field>
      </Modal>
    </>
  )
}

export default function RelationGraph() {
  return (
    <div>
      <PageHeader
        title="人物关系图"
        subtitle="拖拽节点排版，从节点圆点拖出连线建立关系"
        actions={
          <Link to="/characters" className="btn">
            <Plus size={14} />
            管理角色
          </Link>
        }
      />
      <ReactFlowProvider>
        <GraphInner />
      </ReactFlowProvider>
    </div>
  )
}
