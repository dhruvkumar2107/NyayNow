export function CitationChip({ text, sourceUrl, title='Source' }) {
  return (
    <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-[var(--gold-hairline)] text-[var(--text-muted)] text-xs mi-glass-card'>
      {text}
      {sourceUrl && (
        <a href={sourceUrl} target='_blank' rel='noopener noreferrer' className='underline'>[{title}]</a>
      )}
    </span>
  );
}
