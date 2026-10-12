import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, Globe, Search } from 'lucide-react'
import { getCountries, getCountryCallingCode, type CountryCode } from 'libphonenumber-js/min'

const names = new Intl.DisplayNames(['en'], { type: 'region' })
const countries = getCountries().map(code => ({ code, name: names.of(code) ?? code, dial: `+${getCountryCallingCode(code)}` })).sort((a, b) => a.name.localeCompare(b.name, 'en'))
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export function CountryPicker() {
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listId = useId()
  const [country, setCountry] = useState<CountryCode>('CA')
  const [changed, setChanged] = useState(false)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [active, setActive] = useState(0)
  const [placement, setPlacement] = useState({ above: true, width: 530 })
  const selected = countries.find(item => item.code === country)!
  const filtered = countries.filter(item => normalize(`${item.name} ${item.code} ${item.dial}`).includes(normalize(search.trim())))

  useEffect(() => {
    const form = rootRef.current?.closest('form')
    const reset = () => { setCountry('CA'); setChanged(false); setOpen(false) }
    form?.addEventListener('reset', reset)
    return () => form?.removeEventListener('reset', reset)
  }, [])

  useEffect(() => {
    if (!open) return
    searchRef.current?.focus({ preventScroll: true })
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [open])

  useEffect(() => {
    if (open) document.getElementById(`${listId}-${filtered[active]?.code}`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [active, open, listId, search])

  function choose(code: CountryCode) {
    setCountry(code)
    setChanged(true)
    setOpen(false)
    triggerRef.current?.focus({ preventScroll: true })
  }

  function toggle() {
    const bounds = rootRef.current!.getBoundingClientRect()
    setPlacement({ above: bounds.top > 370, width: Math.max(180, window.innerWidth - bounds.left - 24) })
    setSearch('')
    setActive(0)
    setOpen(!open)
  }

  return <div ref={rootRef} className="country-picker" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false)
  }}>
    <input type="hidden" name="country" value={selected.dial} />
    <input type="hidden" name="countryName" value={selected.name} />
    <button ref={triggerRef} className="country-trigger" type="button" aria-label={`Phone country code: ${selected.name} ${selected.dial}`} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? listId : undefined} onClick={toggle}>
      {changed ? <><img className="country-flag" src={`/images/flags/${country}.svg`} alt="" /><span>{selected.dial}</span></> : <Globe size={24} aria-hidden="true" />}
      <ChevronDown size={16} aria-hidden="true" className={open ? 'rotate-180' : ''} />
    </button>
    {open && <div className={`country-dropdown${placement.above ? ' opens-above' : ''}`} style={{ maxWidth: placement.width }}>
      <div className="country-search"><Search size={26} aria-hidden="true" /><input ref={searchRef} type="search" role="combobox" aria-label="Search countries" aria-autocomplete="list" aria-expanded={open} aria-controls={listId} aria-activedescendant={filtered[active] ? `${listId}-${filtered[active].code}` : undefined} placeholder="Search" value={search} onChange={event => { setSearch(event.target.value); setActive(0) }} onKeyDown={event => {
        if (event.key === 'Escape') { event.preventDefault(); setOpen(false); triggerRef.current?.focus({ preventScroll: true }) }
        else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault()
          if (filtered.length) setActive(index => (index + (event.key === 'ArrowDown' ? 1 : -1) + filtered.length) % filtered.length)
        } else if (event.key === 'Enter') {
          event.preventDefault()
          if (filtered[active]) choose(filtered[active].code)
        }
      }} /></div>
      <ul id={listId} className="country-options" role="listbox" aria-label="Countries">
        {filtered.map((item, index) => <li id={`${listId}-${item.code}`} key={item.code} role="option" aria-selected={item.code === country} className={index === active ? 'is-highlighted' : ''} onPointerDown={event => event.preventDefault()} onClick={() => choose(item.code)}>
          <img className="country-flag" src={`/images/flags/${item.code}.svg`} alt="" loading="lazy" /><span>{item.name} {item.dial}</span>
        </li>)}
      </ul>
      {!filtered.length && <p className="country-empty" role="status">No countries found.</p>}
    </div>}
  </div>
}
