"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Menu,
  Minus,
  PartyPopper,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { fullMenu } from "./menu-data";

const BOOKING_PHONE = "919121139238";
const MAP_URL = "https://www.google.com/maps?q=17.3707192,78.5715935";
const DISTRICT_URL = "https://www.district.in/dining/hyderabad/cafe-folha-nagole";

const reveal = {
  initial: { opacity: 0, y: 34 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.22 },
  transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] as const },
};

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

type LookupResult = {
  kind: "reservation" | "event" | "order";
  reference: string;
  status: string;
  title: string;
  date?: string;
  time?: string;
  guests?: number;
  total?: number;
  paymentStatus?: string;
  passReady?: boolean;
};

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [lookupOpen, setLookupOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [dietFilter, setDietFilter] = useState<"all" | "veg" | "nonveg">("all");
  const [menuSearch, setMenuSearch] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [bookingBusy, setBookingBusy] = useState(false);
  const [bookingReference, setBookingReference] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [eventBusy, setEventBusy] = useState(false);
  const [eventReference, setEventReference] = useState("");
  const [eventError, setEventError] = useState("");
  const [orderBusy, setOrderBusy] = useState(false);
  const [orderReference, setOrderReference] = useState("");
  const [orderError, setOrderError] = useState("");
  const [fulfillment, setFulfillment] = useState("Pickup");
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.35], [0, 120]);
  const heroScale = useTransform(scrollYProgress, [0, 0.35], [1, 1.08]);

  const openBooking = () => {
    setBookingReference("");
    setBookingError("");
    setBookingOpen(true);
  };

  const visibleMenu = useMemo(
    () =>
      fullMenu.filter((item) => {
        const categoryMatch = activeCategory === "All" || item.category === activeCategory;
        const dietMatch = dietFilter === "all" || item.diet === dietFilter;
        const searchMatch = item.name.toLowerCase().includes(menuSearch.toLowerCase().trim());
        return categoryMatch && dietMatch && searchMatch;
      }),
    [activeCategory, dietFilter, menuSearch]
  );

  const cartLines = fullMenu
    .filter((item) => cart[item.id])
    .map((item) => ({ ...item, quantity: cart[item.id] }));
  const cartCount = cartLines.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartLines.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const changeCart = (id: string, change: number) => {
    if (change > 0) {
      setOrderReference("");
      setOrderError("");
    }
    setCart((current) => {
      const nextQuantity = Math.max(0, (current[id] || 0) + change);
      const next = { ...current };
      if (nextQuantity === 0) delete next[id];
      else next[id] = nextQuantity;
      return next;
    });
  };

  const orderOnline = () => {
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  };

  const openLookup = () => {
    setLookupError("");
    setLookupResult(null);
    setLookupOpen(true);
  };

  const submitBooking = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBookingBusy(true);
    setBookingError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data)),
      });
      const result = await response.json() as { reference?: string; error?: string };
      if (!response.ok || !result.reference) throw new Error(result.error || "Unable to save your request.");
      setBookingReference(result.reference);
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : "Unable to save your request.");
    } finally {
      setBookingBusy(false);
    }
  };

  const submitEvent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEventBusy(true);
    setEventError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data)),
      });
      const result = await response.json() as { reference?: string; error?: string };
      if (!response.ok || !result.reference) throw new Error(result.error || "Unable to save your event request.");
      setEventReference(result.reference);
    } catch (error) {
      setEventError(error instanceof Error ? error.message : "Unable to save your event request.");
    } finally {
      setEventBusy(false);
    }
  };

  const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cartLines.length) return;
    setOrderBusy(true);
    setOrderError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...Object.fromEntries(data),
          items: cartLines.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
        }),
      });
      const result = await response.json() as { reference?: string; error?: string };
      if (!response.ok || !result.reference) throw new Error(result.error || "Unable to save your order.");
      setOrderReference(result.reference);
      setCart({});
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : "Unable to save your order.");
    } finally {
      setOrderBusy(false);
    }
  };

  const submitLookup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLookupBusy(true);
    setLookupError("");
    setLookupResult(null);
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data)),
      });
      const result = await response.json() as LookupResult & { error?: string };
      if (!response.ok || !result.reference) throw new Error(result.error || "Unable to find that request.");
      setLookupResult(result);
    } catch (error) {
      setLookupError(error instanceof Error ? error.message : "Unable to find that request.");
    } finally {
      setLookupBusy(false);
    }
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
          <button className="nav-track" onClick={openLookup}>Track</button>
        </nav>
        <button className="reserve-button" onClick={openBooking}>
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
            <button onClick={openBooking}>Reserve a table</button>
            <button onClick={() => { setMenuOpen(false); openLookup(); }}>Track a request</button>
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
            <button className="button button-primary" onClick={openBooking}>
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

        <motion.div className="menu-catalogue" {...reveal}>
          <div className="menu-toolbar">
            <div className="menu-categories" aria-label="Menu categories">
              {["All", "Biryani", "Pizza", "Starters", "Comfort", "Sweet & Sip"].map((category) => (
                <button
                  key={category}
                  className={activeCategory === category ? "active" : ""}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <label className="menu-search">
              <Search size={17} />
              <input
                type="search"
                value={menuSearch}
                onChange={(event) => setMenuSearch(event.target.value)}
                placeholder="Find a craving"
                aria-label="Search the menu"
              />
            </label>
          </div>

          <div className="diet-row">
            <span>Show</span>
            {[
              { id: "all", label: "Everything" },
              { id: "veg", label: "Veg" },
              { id: "nonveg", label: "Non-veg" },
            ].map((filter) => (
              <button
                key={filter.id}
                className={dietFilter === filter.id ? "active" : ""}
                onClick={() => setDietFilter(filter.id as "all" | "veg" | "nonveg")}
              >
                {filter.id !== "all" && <i className={`diet-dot ${filter.id}`} />}
                {filter.label}
              </button>
            ))}
            <small>{visibleMenu.length} items</small>
          </div>

          <div className="catalogue-grid">
            <AnimatePresence mode="popLayout">
              {visibleMenu.map((item) => (
                <motion.article
                  layout
                  key={item.id}
                  className="catalogue-item"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                >
                  <div className="catalogue-copy">
                    <i className={`diet-dot ${item.diet}`} aria-label={item.diet === "veg" ? "Vegetarian" : "Non-vegetarian"} />
                    <div>
                      <h3>{item.name}</h3>
                      <p>{item.note || item.category}</p>
                    </div>
                  </div>
                  <div className="catalogue-buy">
                    <strong>₹{item.price}</strong>
                    {cart[item.id] ? (
                      <div className="quantity-control" aria-label={`Quantity for ${item.name}`}>
                        <button onClick={() => changeCart(item.id, -1)} aria-label={`Remove one ${item.name}`}>
                          <Minus size={14} />
                        </button>
                        <span>{cart[item.id]}</span>
                        <button onClick={() => changeCart(item.id, 1)} aria-label={`Add another ${item.name}`}>
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <button className="add-button" onClick={() => changeCart(item.id, 1)}>
                        Add <Plus size={14} />
                      </button>
                    )}
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          {visibleMenu.length === 0 && (
            <div className="menu-empty">
              <p>No matches on this page.</p>
              <button onClick={() => { setMenuSearch(""); setActiveCategory("All"); setDietFilter("all"); }}>
                Reset filters
              </button>
            </div>
          )}

          <div className="menu-disclaimer">
            <p>
              Menu transcribed from Café Folha’s current four-page listing. Prices and availability
              can change; the café confirms the final amount on WhatsApp.
            </p>
            <details>
              <summary>View original menu pages</summary>
              <div className="original-menu-grid">
                {[1, 2, 3, 4].map((page) => (
                  <a key={page} href={`/menu/menu-${page}.webp`} target="_blank" rel="noreferrer">
                    <img src={`/menu/menu-${page}.webp`} alt={`Café Folha original menu page ${page}`} />
                    <span>Page {page} <ArrowRight size={14} /></span>
                  </a>
                ))}
              </div>
            </details>
          </div>
        </motion.div>

        <div className="menu-bottom-row">
          <button className="text-link" onClick={orderOnline}>
            Ask the café about another item <ArrowRight size={18} />
          </button>
          {cartCount > 0 && (
            <motion.button
              className="cart-pill"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag size={17} />
              <span>{cartCount} {cartCount === 1 ? "item" : "items"}</span>
              <strong>₹{cartTotal}</strong>
            </motion.button>
          )}
        </div>
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
            <div className="party-options">
              <span>Birthday table</span>
              <span>Team evening</span>
              <span>Private screening</span>
            </div>
            <button onClick={() => { setEventReference(""); setEventError(""); setEventOpen(true); }}>
              Build an event request <ArrowRight />
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

      <section className="tracking section" id="track">
        <motion.div className="tracking-copy" {...reveal}>
          <div className="section-label">
            <span>04</span> Folha live desk
          </div>
          <h2>Your night,<br /><em>in your pocket.</em></h2>
          <p>
            Check a table, order or event request without making another call.
            Confirmed celebrations unlock a digital Folha pass.
          </p>
          <button className="button button-primary" onClick={openLookup}>
            <Search size={18} /> Track my request
          </button>
        </motion.div>
        <motion.div className="pass-stack" {...reveal}>
          <div className="folio-pass pass-back">
            <span>ORDER DESK</span>
            <strong>Pickup, tracked.</strong>
            <small>ORDER–7FOLHA</small>
          </div>
          <div className="folio-pass pass-front">
            <span>CAFÉ FOLHA · NAGOLE</span>
            <strong>GOOD NIGHT PASS</strong>
            <p>Birthday table · 12 guests</p>
            <div><i>ADMIT</i><b>EVENT–FOLHA</b></div>
          </div>
        </motion.div>
      </section>

      <section className="visit section" id="visit">
        <motion.div className="visit-copy" {...reveal}>
          <div className="section-label light">
            <span>05</span> Your table is this way
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
            <button className="button button-primary" onClick={openBooking}>
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
            <button onClick={openLookup}>Track a request</button>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              Instagram
            </a>
          </div>
          <span>© {new Date().getFullYear()} Café Folha</span>
        </div>
      </footer>

      <div className="mobile-actions">
        <button onClick={() => cartCount ? setCartOpen(true) : document.getElementById("menu")?.scrollIntoView()}>
          <ShoppingBag /> {cartCount ? `Bag · ${cartCount}` : "Order"}
        </button>
        <button onClick={openBooking}><CalendarDays /> Reserve</button>
      </div>

      <AnimatePresence>
        {cartOpen && (
          <motion.div
            className="booking-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setCartOpen(false);
            }}
          >
            <motion.aside
              className="booking-panel cart-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cart-title"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
            >
              <button className="booking-close" onClick={() => setCartOpen(false)} aria-label="Close order bag">
                <X />
              </button>
              <p className="eyebrow">Your Folha run</p>
              <h2 id="cart-title">The good stuff.</h2>
              {orderReference ? (
                <div className="confirmation-card order-confirmation">
                  <ShoppingBag />
                  <p>Order request received</p>
                  <strong>{orderReference}</strong>
                  <small>
                    Café Folha will confirm availability, final amount and pickup or delivery.
                    No payment has been charged.
                  </small>
                  <a
                    className="button button-primary"
                    href={`https://wa.me/${BOOKING_PHONE}?text=${encodeURIComponent(
                      `Hi Café Folha! I’m following up on order ${orderReference}.`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Confirm on WhatsApp <ArrowRight />
                  </a>
                  <button className="track-inline" onClick={() => { setCartOpen(false); openLookup(); }}>
                    Track this order
                  </button>
                </div>
              ) : cartLines.length ? (
                <>
                  <div className="cart-lines">
                    {cartLines.map((item) => (
                      <div className="cart-line" key={item.id}>
                        <div>
                          <i className={`diet-dot ${item.diet}`} />
                          <span>
                            <strong>{item.name}</strong>
                            <small>₹{item.price} each</small>
                          </span>
                        </div>
                        <div className="quantity-control">
                          <button onClick={() => changeCart(item.id, -1)} aria-label={`Remove one ${item.name}`}>
                            {item.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => changeCart(item.id, 1)} aria-label={`Add another ${item.name}`}>
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="cart-total">
                    <span>Estimated total</span>
                    <strong>₹{cartTotal}</strong>
                  </div>
                  <form className="order-checkout-form" onSubmit={submitOrder}>
                    <div className="form-split">
                      <label>
                        Your name
                        <input name="name" autoComplete="name" placeholder="Name" required />
                      </label>
                      <label>
                        Phone
                        <input name="phone" type="tel" autoComplete="tel" placeholder="+91…" required />
                      </label>
                    </div>
                    <label>
                      Fulfilment
                      <select
                        name="fulfillment"
                        value={fulfillment}
                        onChange={(event) => setFulfillment(event.target.value)}
                      >
                        <option>Pickup</option>
                        <option>Delivery request</option>
                      </select>
                    </label>
                    {fulfillment === "Delivery request" && (
                      <label>
                        Delivery address
                        <textarea name="address" rows={3} placeholder="Full Nagole-area address" required />
                      </label>
                    )}
                    <label className="website-field" aria-hidden="true">
                      Website
                      <input name="website" tabIndex={-1} autoComplete="off" />
                    </label>
                    {orderError && <p className="form-error" role="alert">{orderError}</p>}
                    <button className="button button-primary cart-checkout" type="submit" disabled={orderBusy}>
                      {orderBusy ? "Saving order…" : "Create order request"} <ArrowRight />
                    </button>
                  </form>
                  <p className="cart-fine-print">
                    This creates a tracked request, not a paid order. Café Folha confirms
                    availability and the final amount before payment.
                  </p>
                </>
              ) : (
                <div className="empty-cart">
                  <ShoppingBag size={28} />
                  <p>Your bag is waiting for a plot twist.</p>
                  <button onClick={() => { setCartOpen(false); document.getElementById("menu")?.scrollIntoView(); }}>
                    Browse the menu
                  </button>
                </div>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lookupOpen && (
          <motion.div
            className="booking-backdrop lookup-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setLookupOpen(false);
            }}
          >
            <motion.div
              className="booking-panel lookup-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="lookup-title"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
            >
              <button className="booking-close" onClick={() => setLookupOpen(false)} aria-label="Close request tracker">
                <X />
              </button>
              <p className="eyebrow">Folha live desk</p>
              <h2 id="lookup-title">Find your night.</h2>
              <p className="booking-note">
                Use the reference from your table, event or order confirmation and the same phone number.
              </p>
              <form onSubmit={submitLookup}>
                <label>
                  Reference
                  <input name="reference" placeholder="FOLHA-… / EVENT-… / ORDER-…" autoCapitalize="characters" required />
                </label>
                <label>
                  Phone number
                  <input name="phone" type="tel" autoComplete="tel" placeholder="+91…" required />
                </label>
                {lookupError && <p className="form-error" role="alert">{lookupError}</p>}
                <button className="button button-primary" type="submit" disabled={lookupBusy}>
                  {lookupBusy ? "Checking…" : "Show my status"} <ArrowRight />
                </button>
              </form>
              {lookupResult && (
                <motion.div
                  className={`lookup-result ${lookupResult.kind}`}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="lookup-result-top">
                    <span>{lookupResult.kind}</span>
                    <i className={`status ${lookupResult.status}`}>{lookupResult.status}</i>
                  </div>
                  <strong>{lookupResult.reference}</strong>
                  <h3>{lookupResult.title}</h3>
                  <div className="lookup-facts">
                    {lookupResult.date && <span><CalendarDays /> {lookupResult.date}</span>}
                    {lookupResult.time && <span><Clock3 /> {lookupResult.time}</span>}
                    {lookupResult.guests && <span><Users /> {lookupResult.guests} guests</span>}
                    {lookupResult.total && <span><ShoppingBag /> ₹{lookupResult.total}</span>}
                  </div>
                  {lookupResult.kind === "event" && lookupResult.passReady && (
                    <div className="digital-pass">
                      <small>CONFIRMED · DIGITAL PASS</small>
                      <b>{lookupResult.reference}</b>
                      <span>Present this reference at Café Folha</span>
                    </div>
                  )}
                  {lookupResult.kind === "order" && (
                    <p className="payment-state">Payment: {lookupResult.paymentStatus}</p>
                  )}
                  <a
                    href={`https://wa.me/${BOOKING_PHONE}?text=${encodeURIComponent(
                      `Hi Café Folha! I’m checking on ${lookupResult.reference}.`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ask the café on WhatsApp <ArrowRight />
                  </a>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {eventOpen && (
          <motion.div
            className="booking-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setEventOpen(false);
            }}
          >
            <motion.div
              className="booking-panel event-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="event-title"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
            >
              <button className="booking-close" onClick={() => setEventOpen(false)} aria-label="Close event form">
                <X />
              </button>
              <p className="eyebrow">Folha occasions</p>
              <h2 id="event-title">Build your night.</h2>
              {eventReference ? (
                <div className="confirmation-card event-confirmation">
                  <PartyPopper />
                  <p>Event request received</p>
                  <strong>{eventReference}</strong>
                  <small>
                    This is an enquiry reference, not a paid ticket. The café will contact
                    you to confirm the plan, availability and pricing.
                  </small>
                  <a
                    className="button button-primary"
                    href={`https://wa.me/${BOOKING_PHONE}?text=${encodeURIComponent(
                      `Hi Café Folha! I’m following up on event request ${eventReference}.`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Continue on WhatsApp <ArrowRight />
                  </a>
                  <button className="track-inline" onClick={() => { setEventOpen(false); openLookup(); }}>
                    Track this event
                  </button>
                </div>
              ) : (
                <>
                  <p className="booking-note">
                    Tell us the shape of the celebration. You’ll receive a tracking reference;
                    Café Folha will follow up with availability and a tailored plan.
                  </p>
                  <form onSubmit={submitEvent}>
                    <label>
                      Your name
                      <input name="name" type="text" placeholder="Name" autoComplete="name" required />
                    </label>
                    <div className="form-split">
                      <label>
                        Phone
                        <input name="phone" type="tel" placeholder="+91…" autoComplete="tel" required />
                      </label>
                      <label>
                        Email <span>(optional)</span>
                        <input name="email" type="email" placeholder="you@email.com" autoComplete="email" />
                      </label>
                    </div>
                    <div className="form-split">
                      <label>
                        Preferred date
                        <input name="date" type="date" required />
                      </label>
                      <label>
                        Expected guests
                        <input name="guests" type="number" min="4" max="80" defaultValue="12" required />
                      </label>
                    </div>
                    <label>
                      Type of occasion
                      <select name="eventType" defaultValue="Birthday">
                        <option>Birthday</option>
                        <option>Family gathering</option>
                        <option>Team evening</option>
                        <option>Private screening</option>
                        <option>Reunion</option>
                        <option>Other celebration</option>
                      </select>
                    </label>
                    <label>
                      Tell us more <span>(optional)</span>
                      <textarea name="notes" placeholder="Cake, décor, food preferences, timing…" rows={4} />
                    </label>
                    <label className="website-field" aria-hidden="true">
                      Website
                      <input name="website" tabIndex={-1} autoComplete="off" />
                    </label>
                    {eventError && <p className="form-error" role="alert">{eventError}</p>}
                    <button className="button button-primary" type="submit" disabled={eventBusy}>
                      {eventBusy ? "Saving request…" : "Create event enquiry"} <ArrowRight />
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              {bookingReference ? (
                <div className="confirmation-card">
                  <span className="confirmation-icon">✓</span>
                  <p>Request received</p>
                  <strong>{bookingReference}</strong>
                  <small>
                    Keep this reference. Your table is pending until Café Folha confirms it.
                  </small>
                  <a
                    className="button button-primary"
                    href={`https://wa.me/${BOOKING_PHONE}?text=${encodeURIComponent(
                      `Hi Café Folha! I’m following up on reservation ${bookingReference}.`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Follow up on WhatsApp <ArrowRight />
                  </a>
                  <button className="track-inline" onClick={() => { setBookingOpen(false); openLookup(); }}>
                    Track this table
                  </button>
                </div>
              ) : (
                <>
                  <p className="booking-note">
                    Send a real reservation request and receive an instant tracking reference.
                    The café confirms availability separately.
                  </p>
                  <form onSubmit={submitBooking}>
                    <label>
                      Your name
                      <input name="name" type="text" placeholder="Name" autoComplete="name" required />
                    </label>
                    <div className="form-split">
                      <label>
                        Phone
                        <input name="phone" type="tel" placeholder="+91…" autoComplete="tel" required />
                      </label>
                      <label>
                        Email <span>(optional)</span>
                        <input name="email" type="email" placeholder="you@email.com" autoComplete="email" />
                      </label>
                    </div>
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
                    <select name="guests" defaultValue="2">
                      {[
                        ["1", "1 guest"],
                        ["2", "2 guests"],
                        ["3", "3 guests"],
                        ["4", "4 guests"],
                        ["5", "5 guests"],
                        ["6", "6 guests"],
                        ["8", "7–8 guests"],
                        ["12", "9–12 guests"],
                      ].map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Occasion <span>(optional)</span>
                    <input name="occasion" type="text" placeholder="Birthday, family dinner…" />
                  </label>
                    <label className="website-field" aria-hidden="true">
                      Website
                      <input name="website" tabIndex={-1} autoComplete="off" />
                    </label>
                    {bookingError && <p className="form-error" role="alert">{bookingError}</p>}
                    <button className="button button-primary" type="submit" disabled={bookingBusy}>
                      {bookingBusy ? "Saving request…" : "Request this table"} <ArrowRight />
                    </button>
                  </form>
                </>
              )}
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
