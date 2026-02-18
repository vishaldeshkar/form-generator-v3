export default function FileUploader({ name, label, value, onChange, onBlur, error, helpText, disabled }) {
  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file.name);
    }
  };

  return (
    <div className="fg-field">
      {label && <span className="fg-label">{label}</span>}
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 18px',
          border: '1px dashed rgba(255, 255, 255, 0.12)',
          borderRadius: 'var(--radius-sm, 6px)',
          background: 'var(--color-surface-raised, #1e1e27)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'border-color 250ms ease, background 250ms ease',
          fontSize: '0.88rem',
          color: value ? 'var(--color-text, #e8e4df)' : 'var(--color-text-dim, #5c5952)',
          opacity: disabled ? 0.5 : 1,
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = 'var(--color-accent, #d4a053)';
            e.currentTarget.style.background = 'rgba(212, 160, 83, 0.04)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
          e.currentTarget.style.background = 'var(--color-surface-raised, #1e1e27)';
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: 'rgba(212, 160, 83, 0.1)',
            color: '#d4a053',
            fontSize: '16px',
            flexShrink: 0,
          }}
        >
          ↑
        </span>
        <span>{value || 'Choose a file...'}</span>
        <input
          type="file"
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          style={{ display: 'none' }}
        />
      </label>
      {helpText && <p className="fg-help">{helpText}</p>}
      {error && <p className="fg-error">{error}</p>}
    </div>
  );
}
