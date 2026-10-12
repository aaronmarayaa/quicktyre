const services = [
  { title: 'Truck Tires', image: '/images/truck.png', alt: 'QuickTyre technician servicing a Western Star truck', description: 'Complete tire services for light-duty and heavy-duty trucks, including installation, balancing, rotations, swaps, and flat repairs.' },
  { title: 'Heavy Equipment Tires', image: '/images/equipment.png', alt: 'Technician servicing a tire on a yellow CAT skid steer', description: 'Heavy-duty tire services for construction and industrial equipment, including installation, replacement, and flat repairs.' },
  { title: 'Trailer Tires', image: '/images/trailer.png', alt: 'Mobile tire technician replacing a tire on a white trailer', description: 'Reliable trailer tire replacement, repairs, balancing, and maintenance to help keep your trailers safe and road-ready.' },
  { title: 'Car Tires', image: '/images/services/8bda10_67d9d3dc0a1e4345a28bae8aa8832485~mv2.png', alt: 'Mobile technician changing a tire on a black passenger vehicle', description: 'Professional tire sales and services for passenger vehicles, including seasonal changeovers, balancing, rotations, and flat repairs.' },
  { title: 'Semi Truck Tires', image: '/images/services/8bda10_ddb255a6cd244985acb8b1e496393d25~mv2.png', alt: 'Technician inspecting a semi truck tire with a flashlight', description: 'Professional tire sales, installation, replacement, balancing, rotation, and flat repair services for semi trucks.' },
  { title: 'Loader Tires', image: '/images/services/8bda10_1ef6648d098a47e38eff312068d8b8e4~mv2.png', alt: 'Large loader tires on a yellow wheel loader', description: 'Durable tire solutions for loaders, with professional installation, replacement, and repair services.' },
  { title: 'Bobcat Tires', image: '/images/services/8bda10_2ac6bafab0d44c0686911f6efc575c80~mv2.png', alt: 'Compact loader with rugged tires in an orange-lit workshop', description: 'Tire sales, changeovers, repairs, and replacements for Bobcats and other compact equipment.' },
  { title: 'Forklift Tires', image: '/images/services/8bda10_4482f6d3097a4c878430a6897eac90a1~mv2.png', alt: 'Forklift tires in a workshop', description: 'Durable tire solutions for loaders, with professional installation, replacement, and repair services.' },
  { title: 'Other Tires', image: '/images/experts.png', alt: 'Technician fitting an off-road tire in an orange-lit workshop', description: 'Need a different type of tire? Contact us for availability and service options for tires not listed here.' },
]

export function ServicesPage() {
  return <>
    <section className="services-hero" aria-label="Mobile tire service workshop">
      <img src="/images/experts.png" alt="" fetchPriority="high" />
    </section>
    <div className="catalogue-heading"><h1>OUR SERVICES</h1></div>
    <section className="service-catalogue" aria-label="Tire services">
      {services.map(service => <article key={service.title} className="catalogue-item">
        <img src={service.image} alt={service.alt} loading="lazy" />
        <h2>{service.title}</h2>
        <p>{service.description}</p>
        <a href="/contact" className="service-contact">Contact Us<span className="sr-only"> for {service.title}</span></a>
      </article>)}
    </section>
  </>
}
