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
import { FormEvent, useMemo, useRef, useState } from "react";
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

type PassportMember = {
  code: string;
  name: string;
  visits: number;
  rewards: number;
  existing?: boolean;
};

type NightGroup = "duo" | "family" | "crew";
type NightMood = "slow" | "celebrate" | "match";
type NightDiet = "veg" | "nonveg" | "mixed";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [lookupOpen, setLookupOpen] = useState(false);
  const [passportOpen, setPassportOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
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
  const [passportBusy, setPassportBusy] = useState(false);
  const [passportError, setPassportError] = useState("");
  const [passportMember, setPassportMember] = useState<PassportMember | null>(null);
  const [feedbackBusy, setFeedbackBusy] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [nightGroup, setNightGroup] = useState<NightGroup>("duo");
  const [nightMood, setNightMood] = useState<NightMood>("slow");
  const [nightDiet, setNightDiet] = useState<NightDiet>("mixed");
  const clockRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();
  const { scrollYProgress: clockProgress } = useScroll({
    target: clockRef,
    offset: ["start end", "end start"],
    layoutEffect: false,
  });
  const heroY = useTransform(scrollYProgress, [0, 0.35], [0, 120]);
  const heroScale = useTransform(scrollYProgress, [0, 0.35], [1, 1.08]);
  const morningOpacity = useTransform(clockProgress, [0.04, 0.16, 0.31, 0.42], [0, 1, 1, 0]);
  const goldenOpacity = useTransform(clockProgress, [0.29, 0.43, 0.6, 0.71], [0, 1, 1, 0]);
  const nightOpacity = useTransform(clockProgress, [0.58, 0.72, 0.92, 1], [0, 1, 1, 0.82]);
  const clockImageScale = useTransform(clockProgress, [0, 1], [1.12, 1]);
  const clockRailY = useTransform(clockProgress, [0, 1], [40, -40]);
  const clockHandRotate = useTransform(clockProgress, [0, 1], [-75, 115]);

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
  const hasMenuFilters = activeCategory !== "All" || dietFilter !== "all" || Boolean(menuSearch.trim());
  const catalogueItems = menuExpanded || hasMenuFilters ? visibleMenu : visibleMenu.slice(0, 12);
  const nightPlan = useMemo(() => {
    const recommendations: Record<NightDiet, Record<NightGroup, string[]>> = {
      veg: {
        duo: ["peppy-paneer", "chilli-garlic-bites", "mint-mojito", "sizzling-brownie"],
        family: ["paneer-biryani", "veg-loaded", "veg-nuggets", "waffle-overloaded"],
        crew: ["kaju-paneer-biryani", "tandoori-paneer", "cheesy-fries", "waffle-overloaded"],
      },
      nonveg: {
        duo: ["chicken-peri-peri", "chicken-popcorn", "mint-mojito", "sizzling-brownie"],
        family: ["chicken-dum-biryani", "bbq-chicken-pizza", "fried-chicken-momos", "waffle-overloaded"],
        crew: ["chicken-fry-biryani", "tandoori-chicken-pizza", "chicken-loaded-fries", "waffle-overloaded"],
      },
      mixed: {
        duo: ["bbq-chicken-pizza", "chilli-garlic-bites", "mint-mojito", "sizzling-brownie"],
        family: ["chicken-dum-biryani", "veg-loaded", "chicken-popcorn", "waffle-overloaded"],
        crew: ["chicken-fry-biryani", "tandoori-paneer", "chicken-loaded-fries", "waffle-overloaded"],
      },
    };
    const quantities = nightGroup === "crew" ? [2, 2, 2, 1] : nightGroup === "family" ? [1, 1, 2, 1] : [1, 1, 2, 1];
    const items = recommendations[nightDiet][nightGroup].flatMap((id, index) => {
      const item = fullMenu.find((entry) => entry.id === id);
      return item ? [{ ...item, quantity: quantities[index] }] : [];
    });
    const moodCopy = {
      slow: {
        title: "The soft-light chapter",
        seat: "A quieter corner with room to linger",
        time: "Arrive around 6:30 PM",
        cue: "Start cool, share slowly, save the final plate for dessert.",
      },
      celebrate: {
        title: "The table-with-a-reason",
        seat: "A celebration-ready long table",
        time: "Arrive around 7:15 PM",
        cue: "Begin with a table snack and let the mains land together.",
      },
      match: {
        title: "The screen-side spread",
        seat: "The lounge near the match-night screen",
        time: "Arrive 30 minutes before play",
        cue: "Load the table before kickoff and keep dessert for the final whistle.",
      },
    }[nightMood];
    return {
      ...moodCopy,
      items,
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      people: nightGroup === "duo" ? "2 people" : nightGroup === "family" ? "4–6 people" : "7–10 people",
    };
  }, [nightDiet, nightGroup, nightMood]);

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

  const addNightPlan = () => {
    setOrderReference("");
    setOrderError("");
    setCart((current) => {
      const next = { ...current };
      nightPlan.items.forEach((item) => {
        next[item.id] = (next[item.id] || 0) + item.quantity;
      });
      return next;
    });
    setCartOpen(true);
  };

  const orderOnline = () => {
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  };

  const openLookup = () => {
    setLookupError("");
    setLookupResult(null);
    setLookupOpen(true);
  };

  const openPassport = () => {
    setPassportError("");
    setPassportMember(null);
    setPassportOpen(true);
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

  const submitPassport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPassportBusy(true);
    setPassportError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/passport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data)),
      });
      const result = await response.json() as PassportMember & { error?: string };
      if (!response.ok || !result.code) throw new Error(result.error || "Unable to open your Passport.");
      setPassportMember(result);
    } catch (error) {
      setPassportError(error instanceof Error ? error.message : "Unable to open your Passport.");
    } finally {
      setPassportBusy(false);
    }
  };

  const submitFeedback = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedbackBusy(true);
    setFeedbackError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data)),
      });
      const result = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "Unable to save your note.");
      setFeedbackSent(true);
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : "Unable to save your note.");
    } finally {
      setFeedbackBusy(false);
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
          <a href="#composer">Plan a night</a>
          <a href="#passport">Passport</a>
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
            {[
              { id: "story", label: "Our story" },
              { id: "menu", label: "Menu" },
              { id: "gallery", label: "The space" },
              { id: "composer", label: "Plan a night" },
              { id: "passport", label: "Passport" },
              { id: "visit", label: "Visit" },
            ].map((item) => (
              <a key={item.id} href={`#${item.id}`} onClick={() => setMenuOpen(false)}>
                {item.label}
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

      <section className="folha-clock" id="clock" ref={clockRef}>
        <div className="clock-sticky">
          <div className="clock-visual" aria-hidden="true">
            <motion.div className="clock-scene" style={{ opacity: morningOpacity, scale: clockImageScale }}>
              <img src="/folha/folha-3.webp" alt="" />
              <div className="clock-tint morning" />
            </motion.div>
            <motion.div className="clock-scene" style={{ opacity: goldenOpacity, scale: clockImageScale }}>
              <img src="/folha/folha-1.webp" alt="" />
              <div className="clock-tint golden" />
            </motion.div>
            <motion.div className="clock-scene" style={{ opacity: nightOpacity, scale: clockImageScale }}>
              <img src="/folha/folha-2.webp" alt="" />
              <div className="clock-tint night" />
            </motion.div>
            <div className="clock-face">
              <span>11</span><span>5</span><span>8:30</span>
              <motion.i style={{ rotate: clockHandRotate }} />
            </div>
          </div>
          <motion.div className="clock-rail" style={{ y: clockRailY }}>
            <div className="section-label light"><span>02</span> The Folha clock</div>
            <motion.article style={{ opacity: morningOpacity }}>
              <small>11:00 AM · FIRST PLATES</small>
              <h2>Brunch starts<br /><em>without rushing.</em></h2>
              <p>Coolers, golden bites and enough room for the whole family to settle in.</p>
            </motion.article>
            <motion.article style={{ opacity: goldenOpacity }}>
              <small>5:00 PM · GOLDEN HOUR</small>
              <h2>The table<br /><em>keeps growing.</em></h2>
              <p>One pizza becomes two. Friends arrive. The soft lights take over.</p>
            </motion.article>
            <motion.article style={{ opacity: nightOpacity }}>
              <small>8:30 PM · GOOD NIGHT MODE</small>
              <h2>Stay for<br /><em>the last waffle.</em></h2>
              <p>Dinner, dessert, match-night energy—and no reason to call it early.</p>
            </motion.article>
          </motion.div>
          <div className="clock-progress" aria-hidden="true"><motion.span style={{ scaleX: clockProgress }} /></div>
        </div>
      </section>

      <section className="signature section" id="menu">
        <motion.div className="section-label light" {...reveal}>
          <span>03</span> The craving edit
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
              {catalogueItems.map((item) => (
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

          {!hasMenuFilters && visibleMenu.length > 12 && (
            <div className="menu-reveal">
              <button
                onClick={() => {
                  setMenuExpanded((value) => !value);
                  if (menuExpanded) document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
                }}
                aria-expanded={menuExpanded}
              >
                <span>{menuExpanded ? "Return to the curated edit" : `Explore all ${visibleMenu.length} dishes`}</span>
                <i>{menuExpanded ? "−" : "+"}</i>
              </button>
              <small>{menuExpanded ? "The whole menu, still filterable." : "Biryani, pizza, pasta, starters, desserts and more."}</small>
            </div>
          )}

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
            <span>04</span> Find your corner
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

      <section className="mood-section section" id="moods">
        <div className="mood-heading">
          <motion.div className="section-label light" {...reveal}>
            <span>05</span> Choose the energy
          </motion.div>
          <motion.h2 {...reveal}>What kind of<br /><em>night is it?</em></motion.h2>
          <motion.p {...reveal}>Hover into a mood. We’ll point you toward the right corner and the right first plate.</motion.p>
        </div>
        <div className="mood-deck">
          <motion.article className="mood-card mood-date" whileHover={{ y: -10 }}>
            <img src="/folha/folha-2.webp" alt="A softly lit table at Café Folha" />
            <div className="mood-shade" />
            <span>01 · DATE NIGHT</span>
            <div>
              <h3>Soft lights.<br />One more course.</h3>
              <p>Try pizza, a cooler and the sizzling brownie finale.</p>
              <button onClick={openBooking}>Find a table <ArrowRight /></button>
            </div>
          </motion.article>
          <motion.article className="mood-card mood-family" whileHover={{ y: -10 }}>
            <img src="/folha/folha-1.webp" alt="Group seating inside Café Folha" />
            <div className="mood-shade" />
            <span>02 · FAMILY FEAST</span>
            <div>
              <h3>Big table.<br />Bigger spread.</h3>
              <p>Biryani, starters and enough space for every generation.</p>
              <button onClick={openBooking}>Reserve the corner <ArrowRight /></button>
            </div>
          </motion.article>
          <motion.article className="mood-card mood-match" whileHover={{ y: -10 }}>
            <img src="/folha/folha-4.webp" alt="Lounge seating and television at Café Folha" />
            <div className="mood-shade" />
            <span>03 · MATCH NIGHT</span>
            <div>
              <h3>Screen on.<br />Fries loaded.</h3>
              <p>Bring the group for a private screening or a loud, easy catch-up.</p>
              <button onClick={() => { setEventReference(""); setEventError(""); setEventOpen(true); }}>
                Plan the night <ArrowRight />
              </button>
            </div>
          </motion.article>
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

      <section className="night-composer section" id="composer">
        <div className="composer-heading">
          <motion.div className="section-label light" {...reveal}>
            <span>06</span> The Folha Night Composer
          </motion.div>
          <motion.h2 {...reveal}>Don’t pick a dish.<br /><em>Compose the night.</em></motion.h2>
          <motion.p {...reveal}>
            Tell us who is coming, what the night feels like and how the table eats.
            Folha turns it into a real menu route in seconds.
          </motion.p>
        </div>

        <div className="composer-grid">
          <motion.div className="composer-controls" {...reveal}>
            <fieldset>
              <legend><span>01</span> Who has a chair?</legend>
              <div>
                {[
                  { id: "duo", label: "Just us two" },
                  { id: "family", label: "The family" },
                  { id: "crew", label: "The whole crew" },
                ].map((option) => (
                  <button
                    type="button"
                    key={option.id}
                    className={nightGroup === option.id ? "active" : ""}
                    onClick={() => setNightGroup(option.id as NightGroup)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend><span>02</span> What is the energy?</legend>
              <div>
                {[
                  { id: "slow", label: "Soft & slow" },
                  { id: "celebrate", label: "We’re celebrating" },
                  { id: "match", label: "Match-night loud" },
                ].map((option) => (
                  <button
                    type="button"
                    key={option.id}
                    className={nightMood === option.id ? "active" : ""}
                    onClick={() => setNightMood(option.id as NightMood)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend><span>03</span> How does the table eat?</legend>
              <div>
                {[
                  { id: "veg", label: "Veg" },
                  { id: "nonveg", label: "Non-veg" },
                  { id: "mixed", label: "A bit of both" },
                ].map((option) => (
                  <button
                    type="button"
                    key={option.id}
                    className={nightDiet === option.id ? "active" : ""}
                    onClick={() => setNightDiet(option.id as NightDiet)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.article
              className="night-ticket"
              key={`${nightGroup}-${nightMood}-${nightDiet}`}
              initial={{ opacity: 0, rotate: -1.5, y: 24 }}
              animate={{ opacity: 1, rotate: 0, y: 0 }}
              exit={{ opacity: 0, rotate: 1.5, y: -18 }}
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="ticket-topline">
                <span>COMPOSED FOR {nightPlan.people.toUpperCase()}</span>
                <b>FOLHA / TONIGHT</b>
              </div>
              <h3>{nightPlan.title}</h3>
              <div className="ticket-route">
                <span><MapPin /> {nightPlan.seat}</span>
                <span><Clock3 /> {nightPlan.time}</span>
              </div>
              <p>{nightPlan.cue}</p>
              <div className="ticket-menu">
                {nightPlan.items.map((item, index) => (
                  <div key={item.id}>
                    <i>0{index + 1}</i>
                    <span><strong>{item.name}</strong><small>{item.quantity} × ₹{item.price}</small></span>
                    <b>₹{item.quantity * item.price}</b>
                  </div>
                ))}
              </div>
              <div className="ticket-total">
                <span>Suggested spread · estimated</span>
                <strong>₹{nightPlan.total}</strong>
              </div>
              <div className="ticket-actions">
                <button className="button button-primary" onClick={addNightPlan}>
                  Add this night to bag <ShoppingBag />
                </button>
                <button className="button button-ghost" onClick={openBooking}>
                  Reserve its table
                </button>
              </div>
              <small className="ticket-note">Suggestions use Café Folha’s listed menu. Availability and final amount are confirmed by the café.</small>
            </motion.article>
          </AnimatePresence>
        </div>
      </section>

      <section className="tracking section" id="track">
        <motion.div className="tracking-copy" {...reveal}>
          <div className="section-label">
            <span>07</span> Folha live desk
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

      <section className="passport section" id="passport">
        <motion.div className="passport-stage" {...reveal}>
          <motion.div
            className="passport-card"
            whileHover={{ rotateX: -5, rotateY: 8, y: -8 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
          >
            <div className="passport-card-top">
              <span className="brand-mark">F</span>
              <small>CAFÉ FOLHA · NAGOLE</small>
            </div>
            <strong>THE FOLHA<br />PASSPORT</strong>
            <p>Five good nights. One treat on us.</p>
            <div className="passport-stamps">
              {[0, 1, 2, 3, 4].map((stamp) => (
                <i key={stamp} className={stamp < 2 ? "filled" : ""}>{stamp < 2 ? "F" : stamp + 1}</i>
              ))}
            </div>
            <div className="passport-shine" />
          </motion.div>
        </motion.div>
        <motion.div className="passport-copy" {...reveal}>
          <div className="section-label light">
            <span>08</span> Regulars get remembered
          </div>
          <h2>Come back.<br /><em>Leave with more.</em></h2>
          <p>
            Join the Folha Passport, collect a stamp on qualifying visits, and unlock
            a café-confirmed reward after five. Your phone number keeps the pass with you.
          </p>
          <div className="passport-benefits">
            <span><Sparkles /> One simple digital pass</span>
            <span><Star /> Five stamps unlock a reward</span>
            <span><Phone /> No app download required</span>
          </div>
          <button className="button button-primary" onClick={openPassport}>
            Open my Passport <ArrowRight />
          </button>
        </motion.div>
        <motion.div className="passport-explainer" {...reveal}>
          <div className="passport-explainer-head">
            <span>NOT JUST A PRETTY CARD</span>
            <h3>Here’s exactly how it works.</h3>
            <p>No app, points maze or mystery reward. The café stays in control; the guest always knows their progress.</p>
          </div>
          <div className="passport-journey">
            <article>
              <i>01</i>
              <strong>Open it once</strong>
              <p>Enter a name and mobile number. The same details retrieve the same personal Passport code later.</p>
            </article>
            <article>
              <i>02</i>
              <strong>Show it after a visit</strong>
              <p>The Café Folha team verifies a qualifying visit and adds the stamp from its private guest desk.</p>
            </article>
            <article>
              <i>03</i>
              <strong>Unlock at five</strong>
              <p>Five approved stamps make the member reward-ready. The café confirms the treat and records redemption.</p>
            </article>
          </div>
          <div className="passport-value">
            <article>
              <span>FOR GUESTS</span>
              <strong>A reward they can actually see coming.</strong>
              <p>Fast retrieval, visible progress and recognition without downloading another app.</p>
            </article>
            <article>
              <span>FOR CAFÉ FOLHA</span>
              <strong>More return visits, with less guesswork.</strong>
              <p>A permission-light regulars list, measurable loyalty and a natural reason to invite guests back.</p>
            </article>
          </div>
        </motion.div>
      </section>

      <section className="visit section" id="visit">
        <motion.div className="visit-copy" {...reveal}>
          <div className="section-label light">
            <span>09</span> Your table is this way
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
            <button onClick={() => { setFeedbackSent(false); setFeedbackError(""); setFeedbackOpen(true); }}>Leave feedback</button>
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
        {passportOpen && (
          <motion.div
            className="booking-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setPassportOpen(false);
            }}
          >
            <motion.div
              className="booking-panel passport-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="passport-title"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
            >
              <button className="booking-close" onClick={() => setPassportOpen(false)} aria-label="Close Folha Passport">
                <X />
              </button>
              <p className="eyebrow">The regulars’ club</p>
              <h2 id="passport-title">Your Folha Passport.</h2>
              {passportMember ? (
                <div className="passport-live">
                  <div className="passport-live-head">
                    <span>CAFÉ FOLHA · MEMBER</span>
                    <strong>{passportMember.code}</strong>
                  </div>
                  <h3>{passportMember.name}</h3>
                  <p>{passportMember.existing ? "Welcome back." : "Your Passport is open."}</p>
                  <div className="passport-live-stamps">
                    {[0, 1, 2, 3, 4].map((stamp) => (
                      <i key={stamp} className={stamp < passportMember.visits ? "filled" : ""}>
                        {stamp < passportMember.visits ? "F" : stamp + 1}
                      </i>
                    ))}
                  </div>
                  <small>{passportMember.visits}/5 stamps · {passportMember.rewards} rewards redeemed</small>
                  <p className="passport-rule">Show this code to the Café Folha team after a qualifying visit. Rewards and eligibility are confirmed by the café.</p>
                </div>
              ) : (
                <>
                  <p className="booking-note">
                    Open or retrieve your digital pass. One phone number keeps one Passport.
                  </p>
                  <form onSubmit={submitPassport}>
                    <label>
                      Your name
                      <input name="name" autoComplete="name" placeholder="Name" required />
                    </label>
                    <label>
                      Phone number
                      <input name="phone" type="tel" inputMode="numeric" autoComplete="tel" placeholder="10-digit mobile number" required />
                    </label>
                    <label className="website-field" aria-hidden="true">
                      Website
                      <input name="website" tabIndex={-1} autoComplete="off" />
                    </label>
                    {passportError && <p className="form-error" role="alert">{passportError}</p>}
                    <button className="button button-primary" type="submit" disabled={passportBusy}>
                      {passportBusy ? "Opening Passport…" : "Open my Passport"} <ArrowRight />
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {feedbackOpen && (
          <motion.div
            className="booking-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setFeedbackOpen(false);
            }}
          >
            <motion.div
              className="booking-panel feedback-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="feedback-title"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
            >
              <button className="booking-close" onClick={() => setFeedbackOpen(false)} aria-label="Close feedback form">
                <X />
              </button>
              <p className="eyebrow">After the last bite</p>
              <h2 id="feedback-title">Tell us straight.</h2>
              {feedbackSent ? (
                <div className="confirmation-card feedback-confirmation">
                  <Star />
                  <p>Note received</p>
                  <strong>Thank you.</strong>
                  <small>Your feedback is now with the Café Folha team.</small>
                </div>
              ) : (
                <>
                  <p className="booking-note">A private note for the team—good, bad, or delightfully specific.</p>
                  <form onSubmit={submitFeedback}>
                    <label>
                      Your name
                      <input name="name" autoComplete="name" placeholder="Name" required />
                    </label>
                    <label>
                      Phone <span>(optional)</span>
                      <input name="phone" type="tel" autoComplete="tel" placeholder="+91…" />
                    </label>
                    <label>
                      Your rating
                      <select name="rating" defaultValue="5">
                        <option value="5">★★★★★ · Loved it</option>
                        <option value="4">★★★★ · Very good</option>
                        <option value="3">★★★ · It was okay</option>
                        <option value="2">★★ · Needs attention</option>
                        <option value="1">★ · Please follow up</option>
                      </select>
                    </label>
                    <label>
                      Your note
                      <textarea name="message" rows={5} minLength={5} placeholder="Food, service, ambience—tell us what mattered." required />
                    </label>
                    <label className="website-field" aria-hidden="true">
                      Website
                      <input name="website" tabIndex={-1} autoComplete="off" />
                    </label>
                    {feedbackError && <p className="form-error" role="alert">{feedbackError}</p>}
                    <button className="button button-primary" type="submit" disabled={feedbackBusy}>
                      {feedbackBusy ? "Saving your note…" : "Send private feedback"} <ArrowRight />
                    </button>
                  </form>
                </>
              )}
            </motion.div>
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
