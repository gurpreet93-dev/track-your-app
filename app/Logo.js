export default function Logo({ size = 32, showText = true, textColor = 'text-gray-900' }) {
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect x="2" y="2" width="44" height="44" rx="10" fill="#D85A30" />
        <path d="M27 11 L17 26 L23 26 L21 38 L32 22 L26 22 Z" fill="#FFFFFF" />
      </svg>
      {showText && (
        <span className={`font-semibold ${textColor}`}>Track Your App</span>
      )}
    </div>
  );
}