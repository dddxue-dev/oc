import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { seedIfEmpty } from './lib/seed'
import Overview from './pages/Overview'
import Worldview from './pages/Worldview'
import WorldEntryDetail from './pages/WorldEntryDetail'
import Timeline from './pages/Timeline'
import Characters from './pages/Characters'
import CharacterDetail from './pages/CharacterDetail'
import RelationGraph from './pages/RelationGraph'
import Gallery from './pages/Gallery'
import Stories from './pages/Stories'
import StoryDetail from './pages/StoryDetail'
import Forum from './pages/Forum'
import ForumThread from './pages/ForumThread'
import SettingsPage from './pages/Settings'
import NotFound from './pages/NotFound'

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    seedIfEmpty()
      .catch((e) => console.error('初始化示例数据失败', e))
      .finally(() => alive && setReady(true))
    return () => {
      alive = false
    }
  }, [])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-accent text-[14px] font-semibold text-accent-fg">
            OC
          </div>
          <div className="text-[12.5px] text-subtle">正在打开档案馆…</div>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Overview />} />
        <Route path="world" element={<Worldview />} />
        <Route path="world/timeline" element={<Timeline />} />
        <Route path="world/:id" element={<WorldEntryDetail />} />
        <Route path="characters" element={<Characters />} />
        <Route path="characters/graph" element={<RelationGraph />} />
        <Route path="characters/:id" element={<CharacterDetail />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="stories" element={<Stories />} />
        <Route path="stories/:id" element={<StoryDetail />} />
        <Route path="forum" element={<Forum />} />
        <Route path="forum/post/:id" element={<ForumThread />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
