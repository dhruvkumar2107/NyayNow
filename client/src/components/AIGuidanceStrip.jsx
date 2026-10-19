export function AIGuidanceStrip() {
  return (
    <div
      role="note"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'color-mix(in srgb, #D7263D 8%, var(--bg))',
        borderBottom: '1px solid rgba(215,38,61,0.25)',
        color: 'var(--text)',
        fontSize: '12px',
        padding: '6px 10px',
        textAlign: 'center',
      }}
    >
      AI guidance, not legal advice. Drafts require review by a practising advocate.
    </div>
  );
}

export default AIGuidanceStrip;
