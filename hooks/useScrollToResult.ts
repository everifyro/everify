import { RefObject, useEffect } from 'react'

let styleInjected = false

function ensureStyle() {
  if (styleInjected || typeof document === 'undefined') return
  const s = document.createElement('style')
  s.textContent = '.result-highlight { border: 1.5px solid #378ADD !important; box-shadow: 0 0 0 4px rgba(55,138,221,0.15) !important; transition: all 0.3s; }'
  document.head.appendChild(s)
  styleInjected = true
}

export function useScrollToResult(
  resultRef: RefObject<HTMLElement | null>,
  isVisible: boolean
) {
  useEffect(() => {
    if (!isVisible || !resultRef.current) return
    ensureStyle()

    const el = resultRef.current
    const headerHeight = document.querySelector('header')?.offsetHeight ?? 80
    const offsetTop = el.getBoundingClientRect().top + window.scrollY

    window.scrollTo({ top: offsetTop - headerHeight - 16, behavior: 'smooth' })

    el.classList.add('result-highlight')
    const timer = setTimeout(() => {
      el.classList.remove('result-highlight')
    }, 1500)

    return () => clearTimeout(timer)
  }, [isVisible]) // eslint-disable-line react-hooks/exhaustive-deps
}
