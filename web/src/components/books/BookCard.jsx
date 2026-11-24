import React from 'react';
import { Link } from 'react-router-dom';
import { formatPaise } from '../../lib/money';
import { getListingPhotoUrl } from '../../lib/storage';
import './BookCard.css';

const CONDITION_LABELS = {
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

export function BookCard({ book }) {
  if (!book) return null;

  const photoUrl = (book.cover_path || book.cover || book.cover_image) ? getListingPhotoUrl(book.cover_path || book.cover || book.cover_image) : null;
  const conditionLabel = CONDITION_LABELS[book.condition] || book.condition || 'Used';
  const isLabGear = book.item_type === 'lab_gear';

  return (
    <Link to={`/book/${book.id}`} className="book-card" aria-label={`View details for ${book.title}`}>
      <div className="book-card-image-wrap">
        {/* Item Type Badge overlay */}
        <span className={`book-card-badge-type ${isLabGear ? 'badge-gear' : 'badge-book'}`}>
          {isLabGear ? '⚙️ Lab Gear' : '📖 Book'}
        </span>

        {photoUrl ? (
          <img
            src={photoUrl}
            alt={book.title}
            className="book-card-image"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextSibling) {
                e.currentTarget.nextSibling.style.display = 'block';
              }
            }}
          />
        ) : null}
        <span
          className="book-card-placeholder-image"
          style={{ display: photoUrl ? 'none' : 'block' }}
          aria-hidden="true"
        >
          {isLabGear ? '⚙️' : '📖'}
        </span>
      </div>

      <div className="book-card-body">
        <h3 className="book-card-title" title={book.title}>
          {book.title}
        </h3>
        {book.author && (
          <p className="book-card-author" title={book.author}>
            {isLabGear ? 'Gear: ' : 'by '}{book.author}
          </p>
        )}

        <div className="book-card-meta">
          {/* Branch & Semester Tag */}
          {(book.branch || book.semester) && (
            <span className="book-card-branch-tag">
              🎓 {book.branch || 'AITR'} • Sem {book.semester || 1}
            </span>
          )}
          <span className="book-card-condition">{conditionLabel}</span>
        </div>

        {/* Pickup location indicator */}
        {book.pickup_point && (
          <div className="book-card-pickup" title={`Pickup: ${book.pickup_point}`}>
            📍 {book.pickup_point}
          </div>
        )}

        <div className="book-card-footer">
          <span className="book-card-price">{formatPaise(book.price_paise)}</span>
          <span className="book-card-exchange-type" style={{ fontSize: '11px', color: '#6B7280', fontWeight: '500' }}>
            {book.exchange_type || (book.price_paise === 0 ? 'Give Away' : 'Sell')}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function BookCardSkeleton() {
  return (
    <div className="book-card-skeleton" aria-hidden="true">
      <div className="skeleton-image skeleton-pulse" />
      <div className="skeleton-body">
        <div className="skeleton-line title skeleton-pulse" />
        <div className="skeleton-line author skeleton-pulse" />
        <div className="skeleton-line price skeleton-pulse" />
      </div>
    </div>
  );
}
