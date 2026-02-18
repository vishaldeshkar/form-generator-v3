import { useState } from 'react';

export default function StarRating({ name, label, value, onChange, onBlur, error, helpText, disabled }) {
  const [hovered, setHovered] = useState(0);
  const rating = value || 0;

  return (
    <div className="fg-field">
      {label && <span className="fg-label">{label}</span>}
      <div
        style={{ display: 'flex', gap: '6px', cursor: disabled ? 'default' : 'pointer' }}
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => !disabled && onChange(star)}
            onMouseEnter={() => !disabled && setHovered(star)}
            onBlur={onBlur}
            tabIndex={0}
            role="button"
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            style={{
              fontSize: '30px',
              color: star <= (hovered || rating) ? '#d4a053' : 'rgba(255, 255, 255, 0.1)',
              transition: 'color 200ms cubic-bezier(0.22, 1, 0.36, 1), transform 200ms cubic-bezier(0.22, 1, 0.36, 1)',
              transform: star <= hovered ? 'scale(1.15)' : 'scale(1)',
              userSelect: 'none',
              filter: star <= (hovered || rating) ? 'drop-shadow(0 0 6px rgba(212, 160, 83, 0.4))' : 'none',
            }}
          >
            ★
          </span>
        ))}
      </div>
      {helpText && <p className="fg-help">{helpText}</p>}
      {error && <p className="fg-error">{error}</p>}
    </div>
  );
}
