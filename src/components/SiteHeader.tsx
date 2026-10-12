import { useEffect, useRef, useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetTrigger, SheetClose, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'

export type NavigationItem = { label: string; href: string }

type Props = {
  navigation: NavigationItem[]
  active: string
  onNavigate: (href: string) => void
}

export function SiteHeader({ navigation, active, onNavigate }: Props) {
  const headerRef = useRef<HTMLElement>(null)
  const offsetRef = useRef(0)
  const [scrolled, setScrolled] = useState(() => window.scrollY > 30)
  const [offset, setOffset] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let previousY = window.scrollY

    const update = () => {
      const maximumY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      const currentY = Math.max(0, Math.min(window.scrollY, maximumY))
      const delta = currentY - previousY
      setScrolled(currentY > 30)

      const keyboardFocus = headerRef.current?.querySelector(':focus-visible')
      const maximumOffset = (headerRef.current?.offsetHeight ?? 110) + 2
      const secondSection = document.querySelector('[data-header-second-section]') ?? document.getElementById('main')?.children[1]
      const secondBounds = secondSection?.getBoundingClientRect()
      const hideEnd = secondBounds ? secondBounds.top + window.scrollY + secondBounds.height / 2 : window.innerHeight
      let nextOffset = offsetRef.current

      if (currentY <= 30 || menuOpen || keyboardFocus) nextOffset = 0
      else if (delta > 0 && currentY <= hideEnd) nextOffset = maximumOffset * Math.min(1, (currentY - 30) / Math.max(1, hideEnd - 30))
      else if (delta > 0) nextOffset = Math.min(maximumOffset, nextOffset + delta * .75)
      else if (delta < 0) nextOffset = Math.max(0, nextOffset + delta * maximumOffset / 160)

      offsetRef.current = nextOffset
      setOffset(nextOffset)

      previousY = currentY
    }
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    update()
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [menuOpen])

  function reveal() {
    offsetRef.current = 0
    setOffset(0)
  }

  const hidden = offset >= (headerRef.current?.offsetHeight ?? 110) + 1

  return <header ref={headerRef} className={`site-header services-header${scrolled ? ' is-scrolled' : ''}${hidden ? ' is-hidden' : ''}`} style={{ transform: `translateY(${-offset}px)` }} onFocusCapture={reveal}>
    <a href={navigation[0].href} aria-label="QuickTyre Ltd. home" className="header-logo"><img src="/images/logo.avif" alt="QuickTyre Ltd." /></a>
    <nav className="desktop-nav" aria-label="Main navigation">
      {navigation.map(item => <a key={item.label} href={item.href} onClick={() => onNavigate(item.href)} aria-current={active === item.href ? (item.href.startsWith('/') ? 'page' : 'location') : undefined}>{item.label}</a>)}
    </nav>
    <Sheet open={menuOpen} onOpenChange={open => { setMenuOpen(open); reveal() }}>
      <SheetTrigger asChild><Button variant="ghost" className="mobile-menu-button"><span>Menu</span><Menu size={24} /></Button></SheetTrigger>
      <SheetContent>
        <SheetTitle className="mt-14 text-2xl font-bold">QuickTyre Ltd.</SheetTitle>
        <SheetDescription className="mt-2 text-base">Mobile tire service in Calgary</SheetDescription>
        <nav className="mt-9 flex flex-col gap-3" aria-label="Mobile navigation">
          {navigation.map(item => <SheetClose key={item.label} asChild><a className="flex min-h-12 items-center text-xl" href={item.href} onClick={() => onNavigate(item.href)} aria-current={active === item.href ? 'page' : undefined}>{item.label}</a></SheetClose>)}
        </nav>
      </SheetContent>
    </Sheet>
  </header>
}
