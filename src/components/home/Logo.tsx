export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <rect x="3" y="4" width="26" height="7" rx="3.5" fill="#f0609e" />
      <rect x="3" y="13" width="19" height="7" rx="3.5" fill="#f58f5c" />
      <rect x="3" y="22" width="12" height="7" rx="3.5" fill="#f7c548" />
    </svg>
  );
}
