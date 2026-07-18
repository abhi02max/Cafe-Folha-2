"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Menu,
  Phone,
  ShoppingBag,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import { FormEvent, useState } from "react";

const BOOKING_PHONE = "919121139238";
const MAP_URL = "https://www.google.com/maps?q=17.3707192,78.5715935";
const DISTRICT_URL = "https://www.district.in/dining/hyderabad/cafe-folha-nagole";

const reveal = {
  initial: { opacity: 0, y: 34 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.22 },
  transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] as const },
};

const menuGroups = [
  { number: "01", title: "Stone-baked mood", items: "Pizza · Pasta · Burgers" },
  { number: "02", title: "Easy afternoon", items: "Sandwiches · Fast bites · Coffee" },
  { number: "03", title: "Sweet ending", items: "Waffles · Desserts · Beverages" },
];

const reviews = [
  {
    quote:
      "Amazing place with a chill vibe! Great food, friendly service, and a nice interior. Desserts are superb.",
    name: "Bandi Maha Thirupathaiah",
    note: "Local Guide",
  },
  {
    quote:
      "The food is so good—biryani was my favourite. A good spot to visit with family and friends.",
    name: "Deshmukh Waghmare",
    note: "Google review",
  },
  {
    quote:
      "Great service, good ambience and tasty food. Will definitely visit again.",
    name: "Café Folha guest",
    note: "Google review",
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.35], [0, 120]);
  const heroScale = useTransform(scrollYProgress, [0, 0.35], [1, 1.08]);

  const orderOnline = () => {
    const text = encodeURIComponent(
      "Hi Café Folha! I would like to place an order. Please share today’s menu."
    );
    window.open(`https://wa.me/${BOOKING_PHONE}?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const submitBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = encodeURIComponent(
      `Hi Café Folha! I’d like to reserve a table.\n\nName: ${data.get("name")}\nDate: ${data.get(
        "date"
      )}\nTime: ${data.get("time")}\nGuests: ${data.get("guests")}\nOccasion: ${
        data.get("occasion") || "Regular visit"
      }`
    );
    window.open(`https://wa.me/${BOOKING_PHONE}?text=${text}`, "_blank", "noopener,noreferrer");
    setBookingOpen(false);
  };

  return (
    <main>
      <div className="noise" aria-hidden="true" />

      <header className="nav-shell">
        <a className="brand" href="#top" aria-label="Café Folha home">
          <span className="brand-mark">F</span>
          <span>
            CAFÉ <i>FOLHA</i>
          </span>
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#story">Our story</a>
          <a href="#menu">Menu</a>
          <a href="#gallery">The space</a>
          <a href="#visit">Visit</a>
        </nav>
        <button className="reserve-button" onClick={() => setBookingOpen(true)}>
          Reserve a table <ArrowRight size={16} />
        </button>
        <button
          className="menu-toggle"
          aria-label="Open navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {["story", "menu", "gallery", "visit"].map((item) => (
              <a key={item} href={`#${item}`} onClick={() => setMenuOpen(false)}>
                {item === "gallery" ? "The space" : item}
              </a>
            ))}
            <button onClick={() => setBookingOpen(true)}>Reserve a table</button>
          </motion.nav>
        )}
      </AnimatePresence>

      <section className="hero" id="top">
        <motion.div className="hero-photo-wrap" style={{ y: heroY, scale: heroScale }}>
          <img
            className="hero-photo"
            src="/folha/folha-2.webp"
            alt="A jewel-green drink and plated food on a table inside Café Folha"
          />
          <div className="hero-photo-shade" />
        </motion.div>

        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15 }}
        >
          <p className="eyebrow">Nagole · Hyderabad · Open 11 AM–11 PM</p>
          <h1>
            FOOD. FOLKS.
            <span>GOOD NIGHTS.</span>
          </h1>
          <p className="hero-intro">
            Your new neighbourhood table for generous plates, soft-lit conversations,
            and dessert worth staying late for.
          </p>
          <div className="hero-actions">
            <button className="button button-primary" onClick={() => setBookingOpen(true)}>
              <CalendarDays size={18} /> Find a table
            </button>
            <button className="button button-ghost" onClick={orderOnline}>
              <ShoppingBag size={18} /> Order online
            </button>
          </div>
        </motion.div>

        <motion.div
          className="rating-card"
          initial={{ opacity: 0, rotate: 5, scale: 0.85 }}
          animate={{ opacity: 1, rotate: -3, scale: 1 }}
          transition={{ type: "spring", delay: 0.7, stiffness: 120 }}
        >
          <span className="rating-number">4.9</span>
          <span className="stars" aria-label="4.9 out of 5 stars">
            ★★★★★
          </span>
          <span>73 Google reviews</span>
        </motion.div>

        <a className="scroll-cue" href="#story">
          <span>Scroll for a good time</span>
          <ArrowDown size={17} />
        </a>
      </section>

      <section className="ticker" aria-label="Café highlights">
        <div>
          <span>BRUNCH</span><i>✦</i><span>LUNCH</span><i>✦</i><span>DINNER</span><i>✦</i>
          <span>DESSERT</span><i>✦</i><span>FAMILY NIGHTS</span><i>✦</i><span>PARTY TABLES</span><i>✦</i>
          <span>BRUNCH</span><i>✦</i><span>LUNCH</span><i>✦</i><span>DINNER</span><i>✦</i>
        </div>
      </section>

      <section className="story section" id="story">
        <motion.div className="section-label" {...reveal}>
          <span>01</span> The Folha feeling
        </motion.div>
        <div className="story-grid">
          <motion.h2 {...reveal}>
            Not a coffee stop.
            <br />
            <em>A full-evening feeling.</em>
          </motion.h2>
          <motion.div className="story-copy" {...reveal}>
            <p>
              Folha is made for the table that keeps growing—one more friend, one more
              plate, one more story. Come for pizzas and biryani, stay for the warm
              lights, laid-back seating, and that last round of waffles.
            </p>
            <div className="mini-facts">
              <span><Users /> Family & group friendly</span>
              <span><Clock3 /> Open daily until 11 PM</span>
              <span><MapPin /> Bandlaguda Road, Nagole</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="signature section" id="menu">
        <motion.div className="section-label light" {...reveal}>
          <span>02</span> The craving edit
        </motion.div>
        <div className="signature-head">
          <motion.h2 {...reveal}>Pick your plot.</motion.h2>
          <motion.p {...reveal}>
            Multi-cuisine comfort, made for sharing. Swipe the cards, then ask for
            today’s favourites.
          </motion.p>
        </div>

        <div className="dish-row">
          <motion.article className="dish-card dish-card-wide" whileHover={{ y: -12 }}>
            <img src="/folha/folha-5.webp" alt="A cheese-laden pizza at Café Folha" />
            <div className="dish-overlay" />
            <span className="dish-index">01 / THE CROWD-PLEASER</span>
            <div>
              <h3>Pizza after dark</h3>
              <p>Hot, generous, gloriously pull-apart.</p>
            </div>
          </motion.article>
          <motion.article className="dish-card" whileHover={{ y: -12 }}>
            <img src="/folha/folha-3.webp" alt="Golden bite-sized starters at Café Folha" />
            <div className="dish-overlay" />
            <span className="dish-index">02 / START HERE</span>
            <div>
              <h3>Golden bites</h3>
              <p>Crunch, dip, repeat.</p>
            </div>
          </motion.article>
          <motion.article className="dish-card" whileHover={{ y: -12 }}>
            <img src="/folha/folha-2.webp" alt="Green cooler and food at Café Folha" />
            <div className="dish-overlay" />
            <span className="dish-index">03 / COOL DOWN</span>
            <div>
              <h3>Green fizz</h3>
              <p>The table’s brightest plus-one.</p>
            </div>
          </motion.article>
        </div>

        <div className="menu-groups">
          {menuGroups.map((group) => (
            <motion.div key={group.number} className="menu-group" {...reveal}>
              <span>{group.number}</span>
              <h3>{group.title}</h3>
              <p>{group.items}</p>
              <ArrowRight />
            </motion.div>
          ))}
        </div>
        <button className="text-link" onClick={orderOnline}>
          Get today’s menu on WhatsApp <ArrowRight size={18} />
        </button>
      </section>

      <section className="space section" id="gallery">
        <div className="space-heading">
          <motion.div className="section-label" {...reveal}>
            <span>03</span> Find your corner
          </motion.div>
          <motion.h2 {...reveal}>
            Lit for dates.
            <br />
            <em>Built for groups.</em>
          </motion.h2>
        </div>
        <div className="gallery-grid">
          <motion.figure className="gallery-main" {...reveal}>
            <img src="/folha/folha-1.webp" alt="Blue and tan seating inside Café Folha" />
            <figcaption>Long-table energy</figcaption>
          </motion.figure>
          <motion.figure className="gallery-side" {...reveal}>
            <img src="/folha/folha-4.webp" alt="Round lounge seating and television inside Café Folha" />
            <figcaption>Match nights & easy catch-ups</figcaption>
          </motion.figure>
          <motion.div className="party-card" {...reveal}>
            <Sparkles size={26} />
            <p>Birthdays, reunions, office hangs.</p>
            <h3>Bring the whole scene.</h3>
            <button onClick={() => setBookingOpen(true)}>
              Plan a group table <ArrowRight />
            </button>
          </motion.div>
        </div>
      </section>

      <section className="reviews section">
        <motion.div className="review-score" {...reveal}>
          <span>4.9</span>
          <div>
            <div className="stars">★★★★★</div>
            <p>73 reasons to drop in</p>
          </div>
        </motion.div>
        <div className="review-grid">
          {reviews.map((review, index) => (
            <motion.blockquote key={review.name} {...reveal}>
              <Star className="quote-star" fill="currentColor" />
              <p>“{review.quote}”</p>
              <footer>
                <span>0{index + 1}</span>
                <div>
                  <strong>{review.name}</strong>
                  <small>{review.note}</small>
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </section>

      <section className="visit section" id="visit">
        <motion.div className="visit-copy" {...reveal}>
          <div className="section-label light">
            <span>04</span> Your table is this way
          </div>
          <h2>Tonight looks good from here.</h2>
          <p>
            12/1/570, 1st Floor, Lalitha Nagar, Bandlaguda Road, near Chinari
            Children Clinic, Nagole, Hyderabad.
          </p>
          <div className="visit-info">
            <span><Clock3 /> Daily · 11 AM—11 PM</span>
            <span><Phone /> +91 91211 39238</span>
            <span><MapPin /> Free parking nearby</span>
          </div>
          <div className="visit-actions">
            <button className="button button-primary" onClick={() => setBookingOpen(true)}>
              Reserve a table
            </button>
            <a className="button button-ghost" href={MAP_URL} target="_blank" rel="noreferrer">
              Get directions
            </a>
          </div>
        </motion.div>
        <motion.a
          className="visit-photo"
          href={MAP_URL}
          target="_blank"
          rel="noreferrer"
          {...reveal}
        >
          <img src="/folha/folha-1.webp" alt="Dining space at Café Folha" />
          <span><MapPin /> 17.3707° N, 78.5716° E</span>
        </motion.a>
      </section>

      <footer className="footer">
        <div className="footer-wordmark">CAFÉ FOLHA</div>
        <div className="footer-bottom">
          <p>Food. Folks. Good nights.</p>
          <div>
            <a href={DISTRICT_URL} target="_blank" rel="noreferrer">Book on District</a>
            <a href={MAP_URL} target="_blank" rel="noreferrer">Google Maps</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              Instagram
            </a>
          </div>
          <span>© {new Date().getFullYear()} Café Folha</span>
        </div>
      </footer>

      <div className="mobile-actions">
        <button onClick={orderOnline}><ShoppingBag /> Order</button>
        <button onClick={() => setBookingOpen(true)}><CalendarDays /> Reserve</button>
      </div>

      <AnimatePresence>
        {bookingOpen && (
          <motion.div
            className="booking-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setBookingOpen(false);
            }}
          >
            <motion.div
              className="booking-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="booking-title"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
            >
              <button className="booking-close" onClick={() => setBookingOpen(false)} aria-label="Close booking form">
                <X />
              </button>
              <p className="eyebrow">A table is waiting</p>
              <h2 id="booking-title">Make it a Folha night.</h2>
              <p className="booking-note">
                Send a reservation request on WhatsApp. The café will confirm availability.
              </p>
              <form onSubmit={submitBooking}>
                <label>
                  Your name
                  <input name="name" type="text" placeholder="Name" required />
                </label>
                <div className="form-split">
                  <label>
                    Date
                    <input name="date" type="date" required />
                  </label>
                  <label>
                    Time
                    <input name="time" type="time" min="11:00" max="23:00" required />
                  </label>
                </div>
                <label>
                  Party size
                  <select name="guests" defaultValue="2 guests">
                    {["1 guest", "2 guests", "3 guests", "4 guests", "5 guests", "6+ guests"].map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Occasion <span>(optional)</span>
                  <input name="occasion" type="text" placeholder="Birthday, family dinner…" />
                </label>
                <button className="button button-primary" type="submit">
                  Send booking request <ArrowRight />
                </button>
              </form>
              <a className="call-link" href={`tel:+${BOOKING_PHONE}`}>
                Prefer to call? +91 91211 39238
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
