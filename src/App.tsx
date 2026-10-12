import { useEffect, useState, type FormEvent } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CountryPicker } from '@/components/CountryPicker'
import { ScrollStack } from '@/components/ScrollStack'
import { PageReveals } from '@/components/PageReveals'
import { SiteHeader } from '@/components/SiteHeader'
import { ServicesPage } from '@/components/ServicesPage'
import { OurWorksPage } from '@/components/OurWorksPage'

const images = {
  hero: '/images/hero.jpg',
  experts: '/images/experts.png',
  contact: '/images/contact.png',
  trailer: '/images/trailer.png',
  truck: '/images/truck.png',
  equipment: '/images/equipment.png',
  logo: '/images/footer-logo.png',
}

const navigation = [
  { label: 'Home', href: '#home' },
  { label: 'Services', href: '/services' },
  { label: 'Our Works', href: '/our-works' },
  { label: 'Contact', href: '/contact' },
  { label: 'Call us', href: 'tel:+15872849953' },
]

const services = [
  { title: 'Trailer Tires', image: images.trailer, alt: 'Mobile tire technician replacing a tire on a white trailer', description: 'Reliable trailer tire replacement, repairs, balancing, and maintenance to help keep your trailers safe and road-ready.' },
  { title: 'Heavy Equipment Tires', image: images.equipment, alt: 'Technician servicing a tire on a yellow CAT skid steer', description: 'Heavy-duty tire services for construction and industrial equipment, including installation, replacement, and flat repairs.' },
  { title: 'Truck Tires', image: images.truck, alt: 'QuickTyre technician servicing a Western Star truck', description: 'Complete tire services for light-duty and heavy-duty trucks, including installation, balancing, rotations, swaps, and flat repairs.' },
]

const testimonials = [
  { quote: 'Outstanding service! They arrived on time, changed my tires in my driveway and saved me a trip to the shop. They were very friendly and easy to communicate with.', name: 'Dorin L.' },
  { quote: 'Professional, friendly, and very efficient. Highly recommended for anyone needing mobile tire service for any vehicle or even heavy equipment', name: 'Mike E.' },
  { quote: "I highly recommend Quicktyre ltd. We were outside the city and they didn't hesitate to come and help us quickly. I'll definitely save QuickTyre for any vehicle emergency services.", name: 'Bob R.' },
]

function TireMark() {
  return <svg viewBox="0 0 240 240" fill="none" aria-hidden="true" className="tire-mark">
    <circle cx="120" cy="120" r="101" stroke="currentColor" strokeWidth="32" strokeDasharray="31 8" />
    <circle cx="120" cy="120" r="87" stroke="currentColor" strokeWidth="13" />
    <circle cx="120" cy="120" r="77" stroke="currentColor" strokeWidth="4" />
    <circle cx="120" cy="120" r="10" stroke="currentColor" strokeWidth="4" />
  </svg>
}

function App() {
  const isServicesPage = /^\/services\/?$/.test(window.location.pathname)
  const isWorksPage = /^\/(?:our-works|ourworks)\/?$/.test(window.location.pathname)
  const isContactPage = /^\/contact\/?$/.test(window.location.pathname)
  const isInternalPage = isServicesPage || isWorksPage || isContactPage
  const currentPage = isServicesPage ? '/services' : isWorksPage ? '/our-works' : '/contact'
  const pageNavigation = navigation.map(item => ({ ...item, href: isInternalPage && item.href === '#home' ? '/#home' : item.href }))
  const [active, setActive] = useState(isInternalPage ? currentPage : '#home')
  const [expandedServices, setExpandedServices] = useState(false)
  const [submission, setSubmission] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (!window.location.hash) return
    const frame = requestAnimationFrame(() => document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' }))
    return () => cancelAnimationFrame(frame)
  }, [])

  async function submitQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submission === 'sending') return
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 20000)
    setSubmission('sending')
    try {
      const response = await fetch('https://formsubmit.co/ajax/quicktyreltd@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          name: `${data.firstName} ${data.lastName}`.trim() || 'Not provided',
          email: data.email,
          phone: data.phone ? `${data.country} ${data.phone}` : 'Not provided',
          country: data.countryName,
          message: String(data.message ?? '').trim(),
          _subject: `QuickTyre request ${new Date().toISOString()} ${crypto.randomUUID().slice(0, 8)}`,
          _template: 'table',
          _honey: data._honey,
        }),
      })
      const result = await response.json()
      if (!response.ok || (result.success !== true && result.success !== 'true')) throw new Error('Submission failed')
      form.reset()
      setSubmission('success')
    } catch {
      setSubmission('error')
    } finally {
      window.clearTimeout(timeout)
    }
  }

  return <div className={isInternalPage ? `services-page${isWorksPage ? ' works-page' : ''}${isContactPage ? ' contact-page' : ''}` : 'home-page'}>
    <a href="#main" className="skip-link">Skip to content</a>
    <SiteHeader navigation={pageNavigation} active={isInternalPage ? currentPage : active} onNavigate={setActive} />
    <PageReveals />
    <main id="main" tabIndex={-1}>
      {isServicesPage ? <ServicesPage /> : isWorksPage ? <OurWorksPage /> : isContactPage ? <section className="services-hero" aria-label="Mobile tire service workshop"><img src={images.experts} alt="" fetchPriority="high" /></section> : <>
      <ScrollStack>
      <section id="home" className="hero photo-section" aria-label="QuickTyre mobile tire service">
        <img className="section-image hero-image" src={images.hero} alt="Orange QuickTyre service truck with a black and orange off-road wheel" fetchPriority="high" />
        <div className="photo-shade hero-shade" />
        <h1 className="hero-wordmark">Quicktyre</h1>
        <div className="hero-intro">
          <h2>Fast. Reliable. Mobile<br className="desktop-break" /> Tire Service</h2>
          <a href="#contact" className="arrow-link hero-quote">Get a Quote <ArrowRight aria-hidden="true" /></a>
        </div>
      </section>

      <section className="journey" aria-labelledby="journey-title" data-header-second-section>
        <div className="journey-photo photo-section"><img src={images.truck} alt="A mobile tire technician working on a commercial truck" className="section-image" loading="lazy" /><div className="photo-shade" /></div>
        <div className="journey-panel">
          <div className="journey-symbol"><TireMark /></div>
          <div className="journey-copy">
            <h2 id="journey-title">Our Journey in<br /> Tire Care</h2>
            <p>We provide reliable commercial mobile tire services for businesses, fleets, heavy equipment, trucks, and passenger vehicles. We sell a wide range of tires and rims and offer professional tire changeovers, balancing, flat repairs, rotations and tire swaps. Our mobile service helps keep your vehicles and equipment moving with convenient tire support wherever you need it.</p>
          </div>
        </div>
      </section>
      </ScrollStack>

      <section id="services" className="services" aria-labelledby="services-title">
        <div className="services-heading">
          <h2 id="services-title">Top-Tier Services<br /> Tires &amp; Trims</h2>
          <div className="services-intro"><p>From tire changeovers and balancing to flat repairs, rotations and tire swaps, we’ve got you covered.</p>
            <button type="button" className="arrow-link services-link" aria-expanded={expandedServices} aria-controls="all-services" onClick={() => setExpandedServices(!expandedServices)}>{expandedServices ? 'Close all services' : 'See all services'} <ArrowRight aria-hidden="true" className={expandedServices ? 'rotate-90' : ''} /></button>
          </div>
        </div>
        <div id="our-work" className="service-grid">
          {services.map(service => <article key={service.title} className="service-item"><img src={service.image} alt={service.alt} loading="lazy" /><h3>{service.title}</h3><p>{service.description}</p></article>)}
        </div>
        {expandedServices && <div id="all-services" className="all-services"><h3>Mobile tire services</h3><ul>{['Tire and rim sales', 'Tire installation and changeovers', 'Wheel balancing', 'Flat tire repairs', 'Tire rotations', 'Seasonal tire swaps'].map(item => <li key={item}>{item}</li>)}</ul><a href="#contact" className="arrow-link">Request a service quote <ArrowRight aria-hidden="true" /></a></div>}
      </section>

      <ScrollStack>
      <section className="testimonials" aria-labelledby="testimonials-title">
        <h2 id="testimonials-title">Real Stories from Our<br /> Satisfied Customers</h2>
        <div className="testimonials-grid">{testimonials.map(testimonial => <figure key={testimonial.name}><blockquote>"{testimonial.quote}"</blockquote><figcaption>{testimonial.name}</figcaption></figure>)}</div>
      </section>

      <section className="expert-banner photo-section" aria-labelledby="experts-title">
        <img src={images.experts} alt="Tire specialist fitting an off-road tire in a workshop" className="section-image" loading="lazy" /><div className="photo-shade expert-shade" />
        <h2 id="experts-title">Superior Tire Services from<br /> Certified Experts</h2>
        <a href="#services" className="expert-services arrow-link">Our services <ArrowRight aria-hidden="true" /></a>
      </section>

      </ScrollStack>
      </>}
      <section id="contact" className="contact" aria-labelledby="contact-title">
        <div className="contact-main">
          <div className="contact-heading">{isContactPage ? <h1 id="contact-title">Get in Touch</h1> : <h2 id="contact-title">Contact us</h2>}<div><p>{isContactPage ? 'Need tire service? Get in touch with us today for fast, reliable mobile tire solutions.' : isInternalPage ? 'Ready to get back on the road? Contact QuickTyre Ltd. today for fast, professional mobile tire service.' : 'Contact QuickTyre Ltd. today and experience the convenience of professional mobile tire service!'}</p><p>{isInternalPage ? 'For 24/7 emergency service, please call: ' : 'Please call us for 24/7 emergency service: '}<a href="tel:+15872849953">(587) 284-9953</a></p></div></div>
          <form className="quote-form" action="https://formsubmit.co/quicktyreltd@gmail.com" method="POST" onSubmit={submitQuote} aria-busy={submission === 'sending'}>
            <input type="text" name="_honey" className="form-honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <fieldset disabled={submission === 'sending'}>
            <div className="form-row"><div className="form-field"><label htmlFor="first-name">First name{isContactPage ? '' : ' *'}</label><Input id="first-name" name="firstName" autoComplete="given-name" required={!isContactPage} placeholder={isContactPage ? 'First name' : undefined} maxLength={100} pattern=".*\S.*" /></div><div className="form-field"><label htmlFor="last-name">Last name{isContactPage ? '' : ' *'}</label><Input id="last-name" name="lastName" autoComplete="family-name" required={!isContactPage} placeholder={isContactPage ? 'Last name' : undefined} maxLength={100} pattern=".*\S.*" /></div></div>
            <div className="form-row"><div className="form-field"><label htmlFor="email">Email *</label><Input id="email" name="email" type="email" autoComplete="email" required placeholder={isContactPage ? 'Email' : undefined} maxLength={254} /></div><div className="form-field"><label htmlFor="phone">Phone</label><div className="phone-field"><CountryPicker /><Input id="phone" name="phone" type="tel" autoComplete="tel-national" placeholder={isContactPage ? 'Phone' : undefined} maxLength={30} /></div></div></div>
            <div className="form-field message-field"><label htmlFor="message">Message</label><Textarea id="message" name="message" placeholder={isContactPage ? 'Message' : undefined} rows={4} maxLength={5000} /></div>
            <Button type="submit" className="quote-submit">{submission === 'sending' ? 'Sending...' : isContactPage ? 'Submit' : 'Get a Quote'}</Button>
            </fieldset>
            {submission === 'success' && <p className="form-feedback" role="status">Thank you. Your request has been submitted.</p>}
            {submission === 'error' && <p className="form-feedback" role="alert">We couldn’t send your request. Please try again, email <a href="mailto:quicktyreltd@gmail.com">quicktyreltd@gmail.com</a>, or call <a href="tel:+15872849953">(587) 284-9953</a>.</p>}
          </form>
        </div>
        {!isContactPage && <div className="contact-photo"><img src={images.contact} alt="An off-road tire surrounded by tires in an orange-lit workshop" loading="lazy" /></div>}
      </section>
    </main>

    <footer className="site-footer">
      <div className="footer-brand"><a href={isInternalPage ? '/#home' : '#home'} aria-label="QuickTyre home"><img src={images.logo} alt="QuickTyre Ltd." loading="lazy" /></a><p>The Best Mobile Tire Service For You!</p><small>© 2026 Quicktyre LTD. Designed by Ascend Logix</small></div>
      <div className="footer-contact"><h2>Contact</h2><div className="footer-contact-links"><a href="mailto:quicktyreltd@gmail.com">quicktyreltd@gmail.com</a><a href="tel:+15872849953">587-284-9953</a><a href="tel:+15874325914">587-432-5914</a></div><p>Calgary and Surrounding Areas</p></div>
      <div className="footer-menu">
        <h2>Menu</h2>
        <nav aria-label="Footer navigation">
          {pageNavigation.map(item => <a key={item.label} href={item.href} className={(isInternalPage ? item.href === currentPage : active === item.href) ? 'is-active' : ''} onClick={() => setActive(item.href)}>{item.label}</a>)}
        </nav>
        <a href="https://www.facebook.com/quicktyreltdFRANCISJANE" target="_blank" rel="noreferrer" className="facebook-link" aria-label="QuickTyre on Facebook">
          <svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M32 16a16 16 0 1 0-18.5 15.8V20.6h-4V16h4v-3.5c0-4 2.4-6.2 6-6.2 1.8 0 3.7.3 3.7.3v4.1h-2.1c-2 0-2.6 1.2-2.6 2.5V16h4.4l-.7 4.6h-3.7v11.2A16 16 0 0 0 32 16Z" /></svg>
        </a>
      </div>
    </footer>

  </div>
}

export default App
