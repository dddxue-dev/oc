import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Menu, Search, X } from 'lucide-react'
import ColorSwatches from './ColorSwatches'
import SearchPalette from './SearchPalette'
import SideNav from './SideNav'
import ThemeMenu from './ThemeMenu'
import WorldSwitcher from './WorldSwitcher'

const NAV = [
  { to: '/', label: '总览', end: true },
  { to: '/world', label: '世界观' },
  { to: '/characters', label: '人物档案' },
  { to: '/gallery', label: '画廊' },
  { to: '/stories', label: '故事收录' },
  { to: '/forum', label: '论坛' },
  { to: '/settings', label: '设置' },
]

function Brand() {
  return (
    <Link
      to="/"
      className="flex shrink-0 items-center"
      title="OC 档案馆 · 回到总览"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-accent text-[12.5px] font-semibold text-accent-fg">
        OC
      </div>
    </Link>
  )
}

function MainNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5 lg:flex-row lg:items-center lg:gap-0.5">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `rounded-[8px] px-3 py-2 text-[13px] transition-colors lg:py-1.5 ${
              isActive
                ? 'bg-accent-soft font-medium text-accent'
                : 'text-muted hover:bg-sunken hover:text-fg'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="min-h-screen bg-app">
      <header className="sticky top-0 z-30 border-b border-line bg-app/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1320px] items-center gap-3 px-4 lg:px-6">
          <Brand />
          <WorldSwitcher />

          <div className="mx-1 hidden h-5 w-px bg-line lg:block" />

          <div className="hidden lg:block">
            <MainNav />
          </div>

          <div className="flex-1" />

          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-8 items-center gap-2 rounded-[9px] border border-line bg-surface px-2.5 text-[12.5px] text-subtle transition-colors hover:border-line-strong"
            title="搜索档案（Ctrl K）"
          >
            <Search size={13} />
            <span className="hidden sm:inline">搜索</span>
            <span className="hidden text-[10.5px] xl:inline">Ctrl K</span>
          </button>

          <div className="hidden items-center rounded-full border border-line bg-surface px-1.5 py-1 md:flex">
            <ColorSwatches />
          </div>

          <ThemeMenu />

          <button
            className="btn btn-ghost btn-sm lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="打开菜单"
          >
            <Menu size={17} />
          </button>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[272px] flex-col border-r border-line bg-surface">
            <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
              <Brand />
              <div className="min-w-0 flex-1">
                <WorldSwitcher />
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setMobileOpen(false)}
                aria-label="关闭菜单"
              >
                <X size={15} />
              </button>
            </div>
            <div className="border-b border-line px-2 py-2">
              <MainNav onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="border-b border-line px-3 py-3">
              <div className="mb-2 px-0.5 text-[11.5px] font-medium text-muted">配色</div>
              <ColorSwatches withLabel />
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-4">
              <SideNav />
            </div>
          </aside>
        </div>
      ) : null}

      <div className="mx-auto flex w-full max-w-[1320px] px-4 lg:px-6">
        <aside className="hidden w-[176px] shrink-0 lg:block">
          <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto py-6 pr-4">
            <SideNav />
          </div>
        </aside>

        <main className="min-w-0 flex-1 py-6 lg:pl-2">
          <Outlet />
        </main>
      </div>

      <footer className="mx-auto max-w-[1320px] px-4 pb-10 lg:px-6">
        <div className="border-t border-line pt-5 text-[11.5px] text-subtle lg:pl-[176px]">
          OC Archive · 所有内容仅保存在本地浏览器（IndexedDB）。 建议定期在「设置」中导出 JSON
          备份。
        </div>
      </footer>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
