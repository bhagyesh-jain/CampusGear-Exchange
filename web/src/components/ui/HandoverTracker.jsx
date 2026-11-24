import React from 'react';
import './HandoverTracker.css';

const STEPS = [
  { step: 1, label: 'Requested', desc: 'Buyer sent request' },
  { step: 2, label: 'Accepted', desc: 'Seller approved' },
  { step: 3, label: 'Pickup Scheduled', desc: 'Point & time set' },
  { step: 4, label: 'Handed Over', desc: 'Completed & closed' },
];

export function HandoverTracker({ status, pickupPoint, pickupTime, className = '' }) {
  const isTerminal = ['declined', 'cancelled', 'closed'].includes(status);

  let currentStep = 1;
  if (status === 'accepted') currentStep = 2;
  else if (status === 'pickup_scheduled') currentStep = 3;
  else if (status === 'handed_over') currentStep = 4;

  if (isTerminal) {
    return (
      <div className={`handover-tracker-terminal status-${status} ${className}`}>
        <span className="terminal-badge">
          {status === 'declined' && '✕ Request Declined'}
          {status === 'cancelled' && '⊘ Request Cancelled'}
          {status === 'closed' && '🔒 Item No Longer Available (Sold to another student)'}
        </span>
      </div>
    );
  }

  return (
    <div className={`handover-tracker-container ${className}`}>
      <div className="handover-header">
        <span className="handover-title">🤝 Campus Handover Tracker</span>
        <span className="handover-step-indicator">
          Step {currentStep} of 4: {STEPS[currentStep - 1]?.label}
        </span>
      </div>

      <div className="handover-steps-bar">
        {STEPS.map((s, idx) => {
          const isDone = currentStep > s.step || (s.step === 4 && currentStep === 4);
          const isCurrent = currentStep === s.step;

          return (
            <React.Fragment key={s.step}>
              <div
                className={`handover-step-node ${isDone ? 'step-done' : ''} ${isCurrent ? 'step-current' : ''}`}
                title={`${s.label}: ${s.desc}`}
              >
                <div className="step-circle" aria-current={isCurrent ? 'step' : undefined}>
                  {isDone ? '✓' : s.step}
                </div>
                <div className="step-text">
                  <span className="step-label">{s.label}</span>
                </div>
              </div>

              {idx < STEPS.length - 1 && (
                <div className={`handover-connector ${currentStep > s.step ? 'connector-done' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Meetup Coordination Box */}
      {(pickupPoint || pickupTime) && (
        <div className="handover-coordination-box">
          {pickupPoint && (
            <div className="coord-item">
              <span className="coord-icon">📍</span>
              <div className="coord-body">
                <span className="coord-label">Campus Pickup Point:</span>
                <span className="coord-value">{pickupPoint}</span>
              </div>
            </div>
          )}
          {pickupTime && (
            <div className="coord-item">
              <span className="coord-icon">🕒</span>
              <div className="coord-body">
                <span className="coord-label">Pickup Time:</span>
                <span className="coord-value">{pickupTime}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
