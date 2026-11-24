import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { formatPaise } from '../lib/money';
import { getListingPhotoUrl } from '../lib/storage';
import { PICKUP_POINTS } from '../lib/demoData';
import { HandoverTracker } from '../components/ui/HandoverTracker';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Field } from '../components/ui/Field';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Spinner } from '../components/ui/Spinner';
import { Toast } from '../components/ui/Toast';
import './RequestsPage.css';

export function RequestsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('buying'); // 'buying' | 'selling'
  const [buyingRequests, setBuyingRequests] = useState([]);
  const [sellingRequests, setSellingRequests] = useState([]);
  const [sellerWhatsApp, setSellerWhatsApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Per-action loading & WhatsApp resolution states
  const [actionInProgress, setActionInProgress] = useState({});
  const [whatsAppPromptOpen, setWhatsAppPromptOpen] = useState(false);
  const [pendingAcceptId, setPendingAcceptId] = useState(null);

  // Pickup Scheduling Modal State (for sellers)
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [schedulingReq, setSchedulingReq] = useState(null);
  const [schedulePoint, setSchedulePoint] = useState(PICKUP_POINTS[0]);
  const [scheduleTime, setScheduleTime] = useState('Tomorrow 1:15 PM (Lunch Break)');
  const [schedulingLoading, setSchedulingLoading] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, variant = 'info') => {
    setToast({ message, variant });
  };

  // Fetch requests & seller profile
  const fetchRequests = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch buying requests (current user is buyer)
      const buyingQuery = supabase
        .from('interest_requests')
        .select(`
          id,
          message,
          status,
          pickup_point,
          pickup_time,
          created_at,
          responded_at,
          scheduled_at,
          handed_over_at,
          listing:listings (
            id,
            title,
            author,
            item_type,
            branch,
            semester,
            pickup_point,
            price_paise,
            condition,
            status,
            listing_images (storage_path, display_order)
          ),
          seller:profiles!seller_id (
            id,
            display_name
          )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      // 2. Fetch selling requests (current user is seller)
      const sellingQuery = supabase
        .from('interest_requests')
        .select(`
          id,
          message,
          status,
          pickup_point,
          pickup_time,
          created_at,
          responded_at,
          scheduled_at,
          handed_over_at,
          listing:listings (
            id,
            title,
            author,
            item_type,
            branch,
            semester,
            pickup_point,
            price_paise,
            condition,
            status,
            listing_images (storage_path, display_order)
          ),
          buyer:profiles!buyer_id (
            id,
            display_name
          )
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      // 3. Fetch current user's whatsapp number to verify readiness to accept
      const waQuery = supabase
        .from('profile_private')
        .select('whatsapp_number')
        .eq('user_id', user.id)
        .maybeSingle();

      const [buyingRes, sellingRes, waRes] = await Promise.all([
        buyingQuery,
        sellingQuery,
        waQuery,
      ]);

      if (buyingRes.error) throw buyingRes.error;
      if (sellingRes.error) throw sellingRes.error;

      setBuyingRequests(buyingRes.data || []);
      setSellingRequests(sellingRes.data || []);
      setSellerWhatsApp(waRes.data?.whatsapp_number || null);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err.message || 'Failed to load requests.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Handle Cancel Request (for buyers on pending requests)
  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this interest request?')) return;

    setActionInProgress((prev) => ({ ...prev, [requestId]: true }));
    try {
      const { error: rpcError } = await supabase.rpc('cancel_request', {
        p_request_id: requestId,
      });

      if (rpcError) throw rpcError;

      showToast('Interest request cancelled.', 'info');
      await fetchRequests();
    } catch (err) {
      console.error('Failed to cancel request:', err);
      showToast(err.message || 'Unable to cancel request.', 'error');
    } finally {
      setActionInProgress((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  // Handle Respond to Request (for sellers on pending requests: accept / decline)
  const handleRespond = async (requestId, action) => {
    if (action === 'accept') {
      // Check if seller has WhatsApp configured
      if (!sellerWhatsApp || !sellerWhatsApp.trim()) {
        setPendingAcceptId(requestId);
        setWhatsAppPromptOpen(true);
        return;
      }
    }

    if (action === 'decline' && !window.confirm('Decline this buyer request?')) {
      return;
    }

    setActionInProgress((prev) => ({ ...prev, [requestId]: true }));
    try {
      const { error: rpcError } = await supabase.rpc('respond_to_request', {
        p_request_id: requestId,
        p_action: action,
      });

      if (rpcError) throw rpcError;

      showToast(
        action === 'accept'
          ? 'Request accepted! You can now schedule campus pickup coordination.'
          : 'Request declined.',
        'success'
      );
      await fetchRequests();
    } catch (err) {
      console.error(`Failed to ${action} request:`, err);
      if (err.message && err.message.toLowerCase().includes('whatsapp')) {
        setPendingAcceptId(requestId);
        setWhatsAppPromptOpen(true);
      } else {
        showToast(err.message || `Unable to ${action} request.`, 'error');
      }
    } finally {
      setActionInProgress((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  // Open Schedule Pickup Modal (Seller)
  const handleOpenScheduleModal = (req) => {
    setSchedulingReq(req);
    setSchedulePoint(req.pickup_point || req.listing?.pickup_point || PICKUP_POINTS[0]);
    setScheduleTime(req.pickup_time || 'Tomorrow 1:15 PM (Lunch Break)');
    setScheduleModalOpen(true);
  };

  // Submit Schedule Pickup (Seller)
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!schedulingReq) return;

    setSchedulingLoading(true);
    try {
      const { error: rpcError } = await supabase.rpc('schedule_pickup', {
        p_request_id: schedulingReq.id,
        p_pickup_point: schedulePoint,
        p_pickup_time: scheduleTime.trim() || 'Tomorrow 1:15 PM (Lunch Break)',
      });

      if (rpcError) throw rpcError;

      showToast('Campus pickup scheduled successfully!', 'success');
      setScheduleModalOpen(false);
      setSchedulingReq(null);
      await fetchRequests();
    } catch (err) {
      console.error('Failed to schedule pickup:', err);
      showToast(err.message || 'Failed to schedule pickup.', 'error');
    } finally {
      setSchedulingLoading(false);
    }
  };

  // Handle Mark Handed Over (Both Seller & Buyer can mark)
  const handleMarkHandedOver = async (requestId) => {
    if (!window.confirm('Confirm that the item has been physically handed over on campus? This closes the listing as sold and completes the loop!')) {
      return;
    }

    setActionInProgress((prev) => ({ ...prev, [requestId]: true }));
    try {
      const { error: rpcError } = await supabase.rpc('mark_handed_over', {
        p_request_id: requestId,
      });

      if (rpcError) throw rpcError;

      showToast('Item marked as Handed Over! Exchange complete and listing closed.', 'success');
      await fetchRequests();
    } catch (err) {
      console.error('Failed to mark handed over:', err);
      showToast(err.message || 'Failed to complete handover.', 'error');
    } finally {
      setActionInProgress((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  // Handle WhatsApp Click strictly on-demand (never prefetched)
  const handleWhatsAppClick = async (req) => {
    setActionInProgress((prev) => ({ ...prev, [`wa_${req.id}`]: true }));
    try {
      const { data: whatsappNumber, error: rpcError } = await supabase.rpc(
        'get_seller_contact',
        { p_request_id: req.id }
      );

      if (rpcError) throw rpcError;

      if (!whatsappNumber) {
        throw new Error('Seller has not provided a valid WhatsApp number.');
      }

      // Format digits for wa.me URL: remove non-digits
      const digits = whatsappNumber.replace(/[^0-9]/g, '');
      const greeting = `Hi ${req.seller?.display_name || 'there'}! I'm coordinating campus pickup for "${req.listing?.title || 'the listing'}" on CampusGear Exchange. Meetup at: ${req.pickup_point || 'Central Library'}.`;
      const waUrl = `https://wa.me/${digits}?text=${encodeURIComponent(greeting)}`;

      // Open WhatsApp chat in new window
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Failed to get seller contact:', err);
      showToast(
        err.message || 'Unable to retrieve seller contact. Please try again.',
        'error'
      );
    } finally {
      setActionInProgress((prev) => ({ ...prev, [`wa_${req.id}`]: false }));
    }
  };

  // Helper to extract first image path from joined listing
  const getCoverPath = (listing) => {
    if (!listing?.listing_images || listing.listing_images.length === 0) return null;
    const sorted = [...listing.listing_images].sort(
      (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
    );
    return sorted[0]?.storage_path;
  };

  // Badge counts
  const buyingCount = buyingRequests.length;
  const sellingPendingCount = sellingRequests.filter((r) => r.status === 'pending').length;
  const sellingCount = sellingRequests.length;

  const currentList = tab === 'buying' ? buyingRequests : sellingRequests;

  return (
    <div className="requests-page container">
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}

      {/* WhatsApp Prompt Modal for Sellers */}
      {whatsAppPromptOpen && (
        <div className="request-modal-overlay" role="dialog" aria-modal="true">
          <div className="request-modal-content">
            <h2 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-navy)', marginBottom: 'var(--space-2)' }}>
              WhatsApp Number Required
            </h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', marginBottom: 'var(--space-4)', lineHeight: 'var(--line-height-normal)' }}>
              To accept a buyer's interest request, you must have a WhatsApp number set in your profile. CampusGear shares this number only with buyers whose requests you accept so they can coordinate campus pickup.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
              <Button
                variant="ghost"
                onClick={() => {
                  setWhatsAppPromptOpen(false);
                  setPendingAcceptId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate('/profile')}
              >
                Go to Profile
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Pickup Modal (Seller) */}
      {scheduleModalOpen && schedulingReq && (
        <div className="request-modal-overlay" role="dialog" aria-modal="true">
          <div className="request-modal-content">
            <h2 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-navy)', marginBottom: 'var(--space-1)' }}>
              📅 Schedule Campus Pickup
            </h2>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', marginBottom: 'var(--space-4)' }}>
              Coordinate meetup for <strong>{schedulingReq.listing?.title}</strong> with {schedulingReq.buyer?.display_name || 'the buyer'}.
            </p>

            <form onSubmit={handleScheduleSubmit}>
              <Field
                label="Designated Campus Pickup Point"
                as="select"
                value={schedulePoint}
                onChange={(e) => setSchedulePoint(e.target.value)}
                required
              >
                {PICKUP_POINTS.map((pt) => (
                  <option key={pt} value={pt}>
                    📍 {pt}
                  </option>
                ))}
              </Field>

              <Field
                label="Pickup Time & Window"
                placeholder="e.g. Tomorrow 1:15 PM (Lunch Break)"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                required
              />

              {/* Quick time slot suggestion chips */}
              <div className="pickup-time-suggestions">
                <button
                  type="button"
                  className="pickup-time-chip"
                  onClick={() => setScheduleTime('Tomorrow 1:15 PM (Lunch Break)')}
                >
                  Tomorrow 1:15 PM
                </button>
                <button
                  type="button"
                  className="pickup-time-chip"
                  onClick={() => setScheduleTime('Today 4:30 PM (Post Classes)')}
                >
                  Today 4:30 PM
                </button>
                <button
                  type="button"
                  className="pickup-time-chip"
                  onClick={() => setScheduleTime('Tomorrow 10:30 AM (Morning Break)')}
                >
                  Tomorrow 10:30 AM
                </button>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setScheduleModalOpen(false);
                    setSchedulingReq(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={schedulingLoading}
                >
                  Confirm Schedule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="requests-header">
        <h1 className="requests-title">Interest Requests & Handover</h1>
        <p className="requests-subtitle">
          Track semester exchange requests, schedule pickup at designated campus spots, and verify peer handover.
        </p>
      </header>

      {/* Tabs */}
      <div className="requests-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'buying'}
          className={`requests-tab-btn ${tab === 'buying' ? 'active' : ''}`}
          onClick={() => setTab('buying')}
        >
          <span>Buying</span>
          <span className={`requests-badge ${tab === 'buying' ? 'active-badge' : ''}`}>
            {buyingCount}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={tab === 'selling'}
          className={`requests-tab-btn ${tab === 'selling' ? 'active' : ''}`}
          onClick={() => setTab('selling')}
        >
          <span>Selling</span>
          <span className={`requests-badge ${tab === 'selling' ? 'active-badge' : ''}`}>
            {sellingPendingCount > 0 ? `${sellingPendingCount} pending` : sellingCount}
          </span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12) 0' }}>
          <Spinner size="lg" />
          <p style={{ marginTop: 'var(--space-3)', color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)' }}>
            Loading your requests...
          </p>
        </div>
      ) : error ? (
        <ErrorState
          title="Could not load requests"
          message={error}
          onRetry={fetchRequests}
        />
      ) : currentList.length === 0 ? (
        <Card>
          <EmptyState
            title={tab === 'buying' ? 'No outgoing requests' : 'No incoming requests'}
            message={
              tab === 'buying'
                ? 'You haven’t expressed interest in any textbooks or lab gear yet. Browse catalog to find what you need!'
                : 'You have not received any buyer requests yet. Make sure your textbooks or lab equipment are listed with good descriptions!'
            }
            actionLabel={tab === 'buying' ? 'Browse Catalog' : '+ List an Item'}
            onAction={() => navigate(tab === 'buying' ? '/search' : '/sell')}
          />
        </Card>
      ) : (
        <div className="requests-list">
          {currentList.map((req) => {
            const coverPath = getCoverPath(req.listing);
            const coverUrl = coverPath ? getListingPhotoUrl(coverPath) : null;
            const isProcessing = !!actionInProgress[req.id];
            const isWhatsAppLoading = !!actionInProgress[`wa_${req.id}`];
            const isGear = req.listing?.item_type === 'lab_gear';

            return (
              <article key={req.id} className="request-card">
                <div className="request-card-header">
                  {/* Item summary */}
                  <div className="request-book-info">
                    <div className="request-book-thumb">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={req.listing?.title || 'Item thumbnail'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        isGear ? '⚙️' : '📖'
                      )}
                    </div>
                    <div className="request-book-details">
                      {req.listing ? (
                        <Link
                          to={`/book/${req.listing.id}`}
                          className="request-book-title"
                        >
                          {req.listing.title}
                        </Link>
                      ) : (
                        <span className="request-book-title">[Listing Deleted]</span>
                      )}
                      <div className="request-book-meta">
                        <span style={{
                          fontWeight: '700',
                          color: isGear ? '#B45309' : '#1E3A8A',
                          backgroundColor: isGear ? '#FEF3C7' : '#EAF2FF',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontSize: '0.7rem'
                        }}>
                          {isGear ? '⚙️ Lab Gear' : '📖 Book'}
                        </span>
                        {req.listing?.branch && (
                          <span>{req.listing.branch} • Sem {req.listing.semester || 1}</span>
                        )}
                        {req.listing?.price_paise !== undefined && (
                          <span className="request-book-price">
                            {formatPaise(req.listing.price_paise)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span className={`status-pill ${req.status}`}>
                      {req.status === 'pending' && '⏳ Requested'}
                      {req.status === 'accepted' && '✓ Accepted'}
                      {req.status === 'pickup_scheduled' && '📅 Pickup Scheduled'}
                      {req.status === 'handed_over' && '🎉 Handed Over'}
                      {req.status === 'declined' && '✕ Declined'}
                      {req.status === 'cancelled' && '⊘ Cancelled'}
                      {req.status === 'closed' && '🔒 Closed'}
                    </span>
                  </div>
                </div>

                {/* 4-Step Handover Tracker Display */}
                <HandoverTracker
                  status={req.status}
                  pickupPoint={req.pickup_point || req.listing?.pickup_point}
                  pickupTime={req.pickup_time || req.listing?.pickup_time}
                />

                {/* Message display */}
                {req.message && (
                  <div className="request-message-box">
                    <div className="request-message-sender">
                      {tab === 'buying' ? 'Your message:' : `${req.buyer?.display_name || 'Buyer'} says:`}
                    </div>
                    <div>"{req.message}"</div>
                  </div>
                )}

                {/* Footer with Timestamp and Action CTAs */}
                <div className="request-card-footer">
                  <div className="request-date">
                    {tab === 'buying' ? (
                      <>Seller: <strong>{req.seller?.display_name || 'Campus Student'}</strong> • </>
                    ) : (
                      <>Buyer: <strong>{req.buyer?.display_name || 'Campus Student'}</strong> • </>
                    )}
                    {new Date(req.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>

                  <div className="request-actions">
                    {/* Buying Tab Actions */}
                    {tab === 'buying' && (
                      <>
                        {req.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isProcessing}
                            onClick={() => handleCancelRequest(req.id)}
                          >
                            {isProcessing ? 'Cancelling...' : 'Cancel Request'}
                          </Button>
                        )}

                        {req.status === 'accepted' && (
                          <>
                            <span style={{ fontSize: '0.72rem', color: 'var(--color-muted)' }}>
                              Waiting for seller to schedule pickup time...
                            </span>
                            <button
                              type="button"
                              className="btn-whatsapp button button--primary button--sm"
                              disabled={isWhatsAppLoading}
                              onClick={() => handleWhatsAppClick(req)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              {isWhatsAppLoading ? <Spinner size="sm" /> : <span>💬 Chat on WhatsApp</span>}
                            </button>
                          </>
                        )}

                        {req.status === 'pickup_scheduled' && (
                          <>
                            <button
                              type="button"
                              className="btn-whatsapp button button--primary button--sm"
                              disabled={isWhatsAppLoading}
                              onClick={() => handleWhatsAppClick(req)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              {isWhatsAppLoading ? <Spinner size="sm" /> : <span>💬 Chat</span>}
                            </button>
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={isProcessing}
                              onClick={() => handleMarkHandedOver(req.id)}
                              style={{ backgroundColor: '#059669', borderColor: '#047857' }}
                            >
                              {isProcessing ? 'Updating...' : '✓ Mark Handed Over'}
                            </Button>
                          </>
                        )}

                        {req.status === 'handed_over' && (
                          <span style={{ fontSize: '0.75rem', color: '#065F46', fontWeight: '700' }}>
                            ✓ Handover Complete (Item Received)
                          </span>
                        )}
                      </>
                    )}

                    {/* Selling Tab Actions */}
                    {tab === 'selling' && (
                      <>
                        {req.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isProcessing}
                              onClick={() => handleRespond(req.id, 'decline')}
                            >
                              Decline
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={isProcessing}
                              onClick={() => handleRespond(req.id, 'accept')}
                            >
                              {isProcessing ? 'Accepting...' : 'Accept Request'}
                            </Button>
                          </>
                        )}

                        {req.status === 'accepted' && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleOpenScheduleModal(req)}
                              style={{ backgroundColor: '#243B64', borderColor: '#1E3A8A' }}
                            >
                              📅 Schedule Campus Pickup
                            </Button>
                          </>
                        )}

                        {req.status === 'pickup_scheduled' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenScheduleModal(req)}
                            >
                              Reschedule
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={isProcessing}
                              onClick={() => handleMarkHandedOver(req.id)}
                              style={{ backgroundColor: '#059669', borderColor: '#047857' }}
                            >
                              {isProcessing ? 'Updating...' : '✓ Mark Handed Over'}
                            </Button>
                          </>
                        )}

                        {req.status === 'handed_over' && (
                          <span style={{ fontSize: '0.75rem', color: '#065F46', fontWeight: '700' }}>
                            ✓ Handover Complete (Listing Closed)
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
