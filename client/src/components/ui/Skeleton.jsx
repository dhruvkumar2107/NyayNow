export function Skeleton({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-[color-mix(in_srgb,var(--surface)_60%,var(--surface-2))] rounded-[var(--radius-md)] ${className}`}
    />
  );
}

export default Skeleton;
