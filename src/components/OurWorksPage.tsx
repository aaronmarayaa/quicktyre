import { useEffect, useRef, useState } from 'react'

const photos = [
  { id: '73aa7f949d6148278ba9b5606ff91bcd', alt: 'CAT motor grader with tire service equipment in a yard' },
  { id: 'e54a72c8be3548e2a6044960129cf99b', alt: 'Blue and white tanker trailer with three rear axles' },
  { id: '12914d3b9f224f858b11e2c96d266622', alt: 'White water truck parked beside trees' },
  { id: '22aff388111f458882be6d1b49f7e4cf', alt: 'Blue and white commercial truck in a yard' },
  { id: '37ed00fe06a5460caba40da94b962da1', alt: 'Technician servicing a yellow CAT skid steer tire' },
  { id: '590fe9390d5045e1875a54311b22dd5c', alt: 'QuickTyre service truck and technician beside a loader in a workshop' },
  { id: '67d8f1edc1f244a5a7c34ad34b40f178', alt: 'Western Star car carrier truck' },
  { id: '883eca28067c4a2585316defd2cf2e2e', alt: 'Service trucks parked outside a warehouse at night' },
  { id: '990da9edda044838992c67f2d69239e7', alt: 'White water truck with a commercial front tire' },
  { id: 'd1b69f5444d2415ca0d0a2e2967e72a4', alt: 'CAT skid steer with its wheels removed for service' },
  { id: 'e0ee4c594cad470a8ec666de3bebc0bc', alt: 'Technicians beside QuickTyre service trucks at night' },
  { id: 'f0a4e07a0944424990d9e20ee03b3d4d', alt: 'White QuickTyre mobile service pickup' },
  { id: 'f3adfa2573214bd6a42d4956c37e0ffb', alt: 'CAT skid steer with removed wheels in a tire yard' },
]

export function OurWorksPage() {
  const trackRef = useRef<HTMLUListElement>(null)
  const initialPhoto = window.matchMedia('(max-width: 650px)').matches ? 0 : 1
  const centerRef = useRef(initialPhoto)
  const [center, setCenter] = useState(initialPhoto)

  function metrics(track: HTMLUListElement) {
    const width = track.firstElementChild!.getBoundingClientRect().width
    return { step: width + parseFloat(getComputedStyle(track).gap), inset: (track.clientWidth - width) / 2 }
  }

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let timer = 0
    function align() {
      if (!track) return
      const { step, inset } = metrics(track)
      track.scrollTo({ left: (photos.length + centerRef.current) * step - inset, behavior: 'instant' })
    }
    function settle() {
      if (!track) return
      const { step, inset } = metrics(track)
      const index = Math.round((track.scrollLeft + inset) / step)
      if (index < photos.length || index >= photos.length * 2) align()
    }
    function update() {
      if (!track) return
      const { step, inset } = metrics(track)
      const index = Math.round((track.scrollLeft + inset) / step)
      const photo = ((index % photos.length) + photos.length) % photos.length
      centerRef.current = photo
      setCenter(photo)
      window.clearTimeout(timer)
      timer = window.setTimeout(settle, 180)
    }
    const observer = new ResizeObserver(align)
    observer.observe(track)
    track.addEventListener('scroll', update, { passive: true })
    track.addEventListener('scrollend', settle)
    align()
    return () => {
      observer.disconnect()
      track.removeEventListener('scroll', update)
      track.removeEventListener('scrollend', settle)
      window.clearTimeout(timer)
    }
  }, [])

  function move(direction: number) {
    const track = trackRef.current
    if (!track || !track.firstElementChild) return
    const { step, inset } = metrics(track)
    const index = Math.round((track.scrollLeft + inset) / step)
    const left = (index + direction) * step - inset
    track.scrollTo({ left, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }

  return <>
    <section className="services-hero" aria-label="Mobile tire service workshop"><img src="/images/experts.png" alt="" fetchPriority="high" /></section>
    <div className="catalogue-heading"><h1 id="works-title">OUR WORKS</h1></div>
    <section className="work-gallery" aria-labelledby="works-title" aria-roledescription="carousel">
      <div className="work-carousel">
        <ul ref={trackRef} className="work-track" tabIndex={0} aria-label="Our Works photos" onKeyDown={event => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault()
            move(event.key === 'ArrowLeft' ? -1 : 1)
          }
        }}>
          {Array.from({ length: 3 }, (_, cycle) => photos.map((photo, index) => <li className={`work-slide${index === center ? ' is-centered' : ''}`} key={`${cycle}-${photo.id}`} aria-hidden={cycle !== 1 ? true : undefined}>
            <img src={`/images/ourworks/8bda10_${photo.id}~mv2.jpeg`} alt={photo.alt} loading={index < 3 ? 'eager' : 'lazy'} />
          </li>))}
        </ul>
        <button className="gallery-arrow gallery-previous" type="button" aria-label="Previous photos" onClick={() => move(-1)}><svg viewBox="0 0 24 36" aria-hidden="true"><path d="m18 4-12 14 12 14" /></svg></button>
        <button className="gallery-arrow gallery-next" type="button" aria-label="Next photos" onClick={() => move(1)}><svg viewBox="0 0 24 36" aria-hidden="true"><path d="m6 4 12 14L6 32" /></svg></button>
      </div>
      <p className="sr-only" role="status">Photo {center + 1} of {photos.length}</p>
    </section>
    <section className="works-banner photo-section" aria-labelledby="works-banner-title">
      <img className="section-image" src="/images/experts.png" alt="" loading="lazy" />
      <div className="photo-shade" />
      <h2 id="works-banner-title">The Best Mobile Tire Service For You!</h2>
    </section>
  </>
}
