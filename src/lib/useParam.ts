import { useSearchParams } from 'react-router-dom'

/** 把筛选条件同步到 URL query，便于侧边栏与页面联动、也便于分享/回退 */
export function useParamState(key: string) {
  const [params, setParams] = useSearchParams()
  const value = params.get(key)

  const set = (v: string | null) => {
    const next = new URLSearchParams(params)
    if (v === null || v === '') next.delete(key)
    else next.set(key, v)
    setParams(next, { replace: true })
  }

  return [value, set] as const
}
