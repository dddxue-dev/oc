import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-3 text-[40px] font-semibold leading-none text-subtle">404</div>
      <div className="mb-5 text-[14px] text-muted">这个页面不存在，或者已经被删除了。</div>
      <Link to="/" className="btn btn-primary">
        回到总览
      </Link>
    </div>
  )
}
