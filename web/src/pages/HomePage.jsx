import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isConfigured } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { BookCard, BookCardSkeleton } from '../components/books/BookCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import './HomePage.css';

export function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHomeData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch active categories
      const catPromise = supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      // 2. Fetch newest listings via RPC search_listings
      const listingsPromise = supabase.rpc('search_listings', {
        p_query: null,
        p_category: null,
        p_institution: null,
        p_min: null,
        p_max: null,
        p_sort: 'newest',
        p_limit: 8,
        p_offset: 0,
      });

      const [catRes, listingsRes] = await Promise.all([catPromise, listingsPromise]);

      if (catRes.error) throw catRes.error;
      if (listingsRes.error) throw listingsRes.error;

      setCategories(catRes.data || []);
      setListings(listingsRes.data || []);
    } catch (err) {
      console.error('Error loading home data:', err);
      setError(err.message || 'Unable to load books. Please check your connection.');
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
      {/* Hero Header */}
      <header className="home-hero">
        <Link to="/" className="home-brand-logo" aria-label="CampusGear Home">
          <div className="home-logo-icon">C</div>
          <span className="home-logo-text">CampusGear</span>
        </Link>
        <p className="home-subtitle">
          The verified campus textbook &amp; lab-gear exchange. Buy, sell, lend and exchange course books and lab gear with peers at AITR.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="home-search-form" role="search">
          <div className="home-search-input-wrap">
            <input
              type="text"
              className="home-search-input"
              placeholder="Search by title, branch, drafter, calculator, lab coat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search catalog"
            />
          </div>
          <Button type="submit" variant="primary">
            Search
          </Button>
        </form>

        <div className="home-hero-actions">
          <Link to="/sell">
            <Button variant="accent">
              + List Item
            </Button>
          </Link>
          <Link to="/search">
            <Button variant="outline">
              Browse Exchange
            </Button>
          </Link>
        </div>
      </header>

      {/* Category Chips */}
      {categories.length > 0 && (
        <section className="home-categories-section" aria-labelledby="categories-heading">
          <h2 id="categories-heading" className="home-categories-title">
            Browse by Subject
          </h2>
          <div className="home-category-chips">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/search?category=${encodeURIComponent(cat.id)}`}
                className="home-category-chip"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Newest Listings */}
      <section aria-labelledby="newest-heading">
        <div className="home-section-header">
          <h2 id="newest-heading" className="home-section-title">
            Recently Listed
          </h2>
          <Link to="/search?sort=newest" className="home-view-all-link">
            View all listings &rarr;
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
