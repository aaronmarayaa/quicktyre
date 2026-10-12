import { useEffect, useRef, type ReactNode } from 'react'

export function ScrollStack({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const wrapper = ref.current
    const first = wrapper?.firstElementChild
    if (!wrapper || !first) return
    const observer = new ResizeObserver(() => wrapper.style.setProperty('--stack-height', `${first.getBoundingClientRect().height}px`))
    observer.observe(first)
    return () => observer.disconnect()
  }, [])
  return <div ref={ref} className="scroll-stack">{children}</div>
}
