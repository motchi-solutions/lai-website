import Image from "next/image";

import { ContactForm } from "@/components/contact-form";
import { SiteHeader } from "@/components/site-header";

const partners = [
  { src: "/images/partners/jayu.webp", alt: "JAYU" },
  { src: "/images/partners/university-of-toronto.svg", alt: "University of Toronto" },
  { src: "/images/partners/wework.svg", alt: "WeWork" },
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <SiteHeader />
      <main id="main-content">
        <section className="section hero" id="mission" aria-labelledby="mission-title">
          <div className="section-inner hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Now serving the GTA</p>
              <h1 className="display-title" id="mission-title">A drink menu<br />catered to you.</h1>
              <p className="lede">Elevate your event with a premium tea and coffee menu tailored to your theme and budget.</p>
              <a className="button" href="#contact">Tell us about your event</a>
            </div>
            <div className="hero-art" aria-hidden="true">
              <Image className="hero-photo" src="/images/hero-drinks.png" alt="" width={480} height={480} priority sizes="(max-width: 800px) 82vw, 38vw" />
              <Image className="hero-loop" src="/images/textures/hero-loop.png" alt="" width={740} height={517} loading="eager" sizes="(max-width: 900px) 92vw, 48vw" />
            </div>
          </div>
        </section>

        <section className="section events" id="events" aria-labelledby="events-title">
          <div className="section-inner events-grid">
            <div className="events-copy">
              <h2 className="display-title" id="events-title">Take drink<br />planning off<br />your plate.</h2>
              <p className="lede">From corporate to community events, our custom menus make refreshment simple and delicious.</p>
            </div>
            <div className="event-gallery" aria-label="A selection of Lai catered events">
              <figure className="gallery-large"><Image src="/images/showcase/event-table.jpg" alt="Matcha and fruit tea served beside flowers at an event" fill loading="eager" sizes="(max-width: 900px) 100vw, 35vw" /></figure>
              <figure><Image src="/images/showcase/refreshers.png" alt="Two colourful iced refreshers" fill sizes="(max-width: 800px) 50vw, 23vw" /></figure>
              <figure><Image src="/images/showcase/event-service.jpg" alt="A barista preparing drinks at an event" fill sizes="(max-width: 800px) 50vw, 23vw" /></figure>
            </div>
          </div>
          <div className="partners section-inner" aria-labelledby="partners-title">
            <h3 id="partners-title">Trusted by</h3>
            <div className="partner-list">
              {partners.map((partner) => <Image key={partner.alt} src={partner.src} alt={partner.alt} width={220} height={70} />)}
            </div>
          </div>
        </section>

        <section className="section method" id="method" aria-labelledby="method-title">
          <div className="section-inner method-grid">
            <Image className="method-art" src="/images/method-drinks.png" alt="Three original Lai drinks: matcha, a fruit refresher, and coffee" width={600} height={776} loading="eager" sizes="(max-width: 900px) 90vw, 44vw" />
            <div className="method-copy">
              <h2 className="display-title" id="method-title">Original flavours your guests will notice.</h2>
              <p className="lede">Every drink on your menu is handcrafted with carefully chosen ingredients. It&apos;s all made fresh for your guests to enjoy.</p>
            </div>
          </div>
        </section>

        <section className="section contact" id="contact" aria-labelledby="contact-title">
          <div className="section-inner contact-grid">
            <div className="contact-copy">
              <h2 className="display-title" id="contact-title">Share your vision.<br />We&apos;ll handle the rest.</h2>
              <Image className="contact-loop" src="/images/textures/contact-loop.png" alt="" width={604} height={568} loading="eager" sizes="(max-width: 900px) 90vw, 38vw" aria-hidden="true" />
            </div>
            <ContactForm />
          </div>
        </section>
      </main>
      <footer><p>© {new Date().getFullYear()} Lai Catering. Serving the Greater Toronto Area.</p></footer>
    </>
  );
}
