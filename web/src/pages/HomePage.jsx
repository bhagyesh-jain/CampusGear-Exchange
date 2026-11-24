import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { BookCard, BookCardSkeleton } from '../components/books/BookCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { INITIAL_DEMO_BOOKS, generateCoverSvg } from '../lib/demoData';
import './HomePage.css';

// 6 Categories defined in user specification
const CATEGORY_TILES = [
  {
    id: 'textbook',
    title: 'Textbook',
    subtitle: 'Core theory & branch syllabus',
    badge: '13 Available',
    filterUrl: '/search?type=book',
    icon: '📖',
    accent: '#111111',
    bg: '#FAF7F2',
  },
  {
    id: 'lab_gear',
    title: 'Lab Gear',
    subtitle: 'Workshop tools & equipment',
    badge: '5 Available',
    filterUrl: '/search?type=lab_gear',
    icon: '⚙️',
    accent: '#B42318',
    bg: '#FAF7F2',
  },
  {
    id: 'drafter',
    title: 'Drafter Set',
    subtitle: 'Engineering drawing & scales',
    badge: 'Sem 1 & 2',
    filterUrl: '/search?q=Drafter',
    icon: '📐',
    accent: '#111111',
    bg: '#FAF7F2',
  },
  {
    id: 'calculator',
    title: 'Calculator',
    subtitle: 'fx-991 scientific calculators',
    badge: 'EC / ME / EE',
    filterUrl: '/search?q=Calculator',
    icon: '🧮',
    accent: '#111111',
    bg: '#FAF7F2',
  },
  {
    id: 'lab_coat',
    title: 'Lab Coat',
    subtitle: 'Cotton aprons & safety goggles',
    badge: 'Chemistry & Mech',
    filterUrl: '/search?q=Lab+Coat',
    icon: '🥼',
    accent: '#B42318',
    bg: '#FAF7F2',
  },
  {
    id: 'notes',
    title: 'Notes',
    subtitle: 'Exam prep & topper summaries',
    badge: 'GATE & Sem',
    filterUrl: '/search?q=Notes',
    icon: '📝',
    accent: '#111111',
    bg: '#FAF7F2',
  },
];

// 3 Collections defined in user specification
const COLLECTIONS = [
  {
    id: 'most-requested',
    eyebrow: 'CAMPUS DEMAND',
    title: 'Most Requested',
    description: 'High-demand algorithms textbooks, scientific calculators, and core branch equipment sought after this semester.',
    linkText: 'Explore Collection →',
    filterUrl: '/search?sort=popular',
    badge: 'High Circulation',
    icon: '🔥',
  },
  {
    id: 'just-listed',
    eyebrow: 'FRESH ARRIVALS',
    title: 'Just Listed',
    description: 'Recently listed by passing-out seniors and peers transitioning into their upcoming academic term.',
    linkText: 'View Just Listed →',
    filterUrl: '/search?sort=newest',
    badge: 'Latest Listings',
    icon: '✨',
  },
  {
    id: 'sem1-essentials',
    eyebrow: 'FRESHER STARTER PACK',
    title: 'Sem 1 Essentials',
    description: 'Engineering drafter kits, drawing instruments, basic math textbooks, and workshop lab aprons for freshers.',
    linkText: 'View Sem 1 Gear →',
    filterUrl: '/search?semester=1',
    badge: 'Semester 1',
    icon: '🎒',
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generate SVG preview covers for right-side hero visual
  const featuredStack = [
    {
      title: 'Engineering Drafter Set',
      author: 'Omega Standard',
      type: 'lab_gear',
      branch: 'CSIT Sem 1',
      price: '₹450',
      cover: generateCoverSvg({
        title: 'Engineering Drafter Set',
        author: 'Omega Standard',
        category: 'Lab Gear',
        colorHex: '#0F766E',
        accentHex: '#B42318',
        itemType: 'lab_gear',
      }),
    },
    {
      title: 'Operating System Concepts',
      author: 'Silberschatz & Galvin',
      type: 'book',
      branch: 'CSIT Sem 3',
      price: '₹420',
      cover: generateCoverSvg({
        title: 'Operating System Concepts',
        author: 'Silberschatz',
        category: 'Computer Science',
        colorHex: '#1E293B',
        accentHex: '#B42318',
        itemType: 'book',
      }),
    },
    {
      title: 'Scientific Calculator fx-991',
      author: 'Casio ClassWiz',
      type: 'lab_gear',
      branch: 'EC Sem 2',
      price: '₹650',
      cover: generateCoverSvg({
        title: 'Scientific Calculator fx-991',
        author: 'Casio',
        category: 'Lab Gear',
        colorHex: '#262626',
        accentHex: '#B42318',
        itemType: 'lab_gear',
      }),
    },
  ];

  const fetchHomeData = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('search_listings', {
        p_query: null,
        p_category: null,
        p_institution: null,
        p_min: null,
        p_max: null,
        p_sort: 'newest',
        p_limit: 8,
        p_offset: 0,
      });

      if (rpcError) throw rpcError;
      setListings(data || []);
    } catch (err) {
      console.error('Error loading home data:', err);
      setError(err.message || 'Unable to load items. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="home-page container">
      {/* ── 1. EDITORIAL HERO ── */}
      <section className="editorial-hero" aria-labelledby="hero-headline">
        <div className="hero-split-grid">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="hero-left-col">
            <span className="hero-eyebrow">READ • DISCOVER • EXCHANGE</span>

            <h1 id="hero-headline" className="hero-title">
              Find Textbooks &amp; Lab Gear From Your Seniors
            </h1>

            <p className="hero-subtext">
              CampusGear Exchange is AITR's verified peer-to-peer exchange. Buy, sell, lend, and exchange textbooks and lab gear with students on campus.
            </p>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="hero-search-bar" role="search">
              <input
                type="text"
                className="hero-search-input"
                placeholder="Search by title, branch, drafter, calculator, lab coat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search catalog"
              />
              <button type="submit" className="hero-search-btn" aria-label="Search">
                🔍
              </button>
            </form>

            {/* Action Buttons: Browse Exchange (black) and List an Item (white with black border) */}
            <div className="hero-btn-row">
              <Link to="/search">
                <Button variant="primary" size="lg" className="hero-btn-browse">
                  Browse Exchange
                </Button>
              </Link>
              <Link to="/sell">
                <Button variant="accent" size="lg" className="hero-btn-list">
                  List an Item
                </Button>
              </Link>
            </div>

            {/* Stats Underneath: Our Real Numbers Only */}
            <div className="hero-stats-bar" aria-label="Platform Statistics">
              <div className="stat-unit">
                <span className="stat-number">18</span>
                <span className="stat-label">Listings</span>
              </div>
              <span className="stat-divider" aria-hidden="true">|</span>
              <div className="stat-unit">
                <span className="stat-number">6</span>
                <span className="stat-label">Branches</span>
              </div>
              <span className="stat-divider" aria-hidden="true">|</span>
              <div className="stat-unit">
                <span className="stat-number">5</span>
                <span className="stat-label">Pickup Points</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Visual Using Existing Covers (Stacked Textbooks & Lab Gear) */}
          <div className="hero-right-col" aria-hidden="true">
            <div className="editorial-stack-wrapper">
              <div className="stack-card stack-card-1">
                <img src={featuredStack[0].cover} alt="" className="stack-img" />
                <div className="stack-info-pill">
                  <span className="stack-badge-gear">⚙️ Lab Gear</span>
                  <span className="stack-info-title">{featuredStack[0].title}</span>
                  <span className="stack-info-price">{featuredStack[0].price}</span>
                </div>
              </div>

              <div className="stack-card stack-card-2">
                <img src={featuredStack[1].cover} alt="" className="stack-img" />
                <div className="stack-info-pill">
                  <span className="stack-badge-book">📖 Textbook</span>
                  <span className="stack-info-title">{featuredStack[1].title}</span>
                  <span className="stack-info-price">{featuredStack[1].price}</span>
                </div>
              </div>

              <div className="stack-card stack-card-3">
                <img src={featuredStack[2].cover} alt="" className="stack-img" />
                <div className="stack-info-pill">
                  <span className="stack-badge-gear">⚙️ Lab Gear</span>
                  <span className="stack-info-title">{featuredStack[2].title}</span>
                  <span className="stack-info-price">{featuredStack[2].price}</span>
                </div>
              </div>

              {/* Floating Campus Handshake Seal */}
              <div className="hero-floating-seal">
                <div className="seal-icon">🏛️</div>
                <div className="seal-text">
                  <strong>AITR Indore</strong>
                  <span>Verified Campus Handshake</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. CATEGORIES VISUAL GRID ── */}
      <section className="home-categories-section" aria-labelledby="categories-heading">
        <div className="section-header-block">
          <span className="section-eyebrow">CAMPUS EQUIPMENT &amp; ACADEMICS</span>
          <h2 id="categories-heading" className="section-title">
            Browse by Category
          </h2>
        </div>

        <div className="categories-visual-grid">
          {CATEGORY_TILES.map((cat) => (
            <Link
              key={cat.id}
              to={cat.filterUrl}
              className="category-tile-card"
              aria-label={`Browse ${cat.title}`}
            >
              <div className="tile-top-bar">
                <span className="tile-icon" aria-hidden="true">{cat.icon}</span>
                <span className="tile-badge">{cat.badge}</span>
              </div>
              <div className="tile-content">
                <h3 className="tile-title">{cat.title}</h3>
                <p className="tile-subtitle">{cat.subtitle}</p>
              </div>
              <div className="tile-footer">
                <span className="tile-explore-link">Explore &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 3. COLLECTIONS ── */}
      <section className="home-collections-section" aria-labelledby="collections-heading">
        <div className="section-header-block">
          <span className="section-eyebrow">CURATED RECOMMENDATIONS</span>
          <h2 id="collections-heading" className="section-title">
            Collections
          </h2>
          <p className="section-subtitle">
            Handpicked for every kind of student.
          </p>
        </div>

        <div className="collections-grid">
          {COLLECTIONS.map((col) => (
            <Link
              key={col.id}
              to={col.filterUrl}
              className="collection-card"
              aria-label={`View collection: ${col.title}`}
            >
              <div className="collection-card-header">
                <span className="collection-eyebrow">{col.eyebrow}</span>
                <span className="collection-icon" aria-hidden="true">{col.icon}</span>
              </div>
              <h3 className="collection-title">{col.title}</h3>
              <p className="collection-desc">{col.description}</p>
              <div className="collection-footer">
                <span className="collection-action-link">{col.linkText}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── RECENTLY LISTED CATALOG ── */}
      <section className="home-recent-section" aria-labelledby="recent-heading">
        <div className="section-header-row">
          <div>
            <span className="section-eyebrow">LIVE EXCHANGE BOARD</span>
            <h2 id="recent-heading" className="section-title">
              Recently Listed
            </h2>
          </div>
          <Link to="/search?sort=newest" className="view-all-link">
            View all 18 listings &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="home-listings-grid">
            {Array.from({ length: 8 }).map((_, idx) => (
              <BookCardSkeleton key={idx} />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load items"
            message={error}
            onRetry={fetchHomeData}
          />
        ) : listings.length === 0 ? (
          <EmptyState
            title="No items listed yet"
            message="Be the first student to list textbook or lab gear on your campus!"
            actionLabel="List an Item"
            onAction={() => navigate('/sell')}
          />
        ) : (
          <div className="home-listings-grid">
            {listings.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
