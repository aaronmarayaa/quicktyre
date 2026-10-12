import { useEffect } from 'react'

export function PageReveals() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('.hero-wordmark, .hero-intro, .journey-copy, .journey-photo img, .services-heading, .service-item, .testimonials h2, .testimonials-grid figure, .expert-banner h2, .expert-banner img, .catalogue-heading h1, .catalogue-item, .work-carousel, .works-banner h2, .contact-heading, .quote-form, .contact-photo img')
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed')
          observer.unobserve(entry.target)
        }
      }
    }, { threshold: .08 })
    for (const element of elements) {
      element.classList.add('scroll-reveal')
      observer.observe(element)
    }
    return () => {
      observer.disconnect()
      for (const element of elements) element.classList.remove('scroll-reveal', 'is-revealed')
    }
  }, [])
  return null
}
