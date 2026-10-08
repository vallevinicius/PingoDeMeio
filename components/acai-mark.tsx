/**
 * Flat, papercut-style mark: a bowl of açaí with a swirl of cream and a few
 * toppings, fronds fanning off one corner. No gradients, no blur — solid
 * shapes in the brand palette, cut like paper. Reused across the login
 * illustration and as a quiet watermark on the dashboard's hero card.
 */
export function AcaiMark({ className, id = 'acai' }: { className?: string; id?: string }) {
  const frondId = `${id}-frond`
  return (
    <svg viewBox="-50 20 460 360" fill="none" className={className} aria-hidden="true">
      <g stroke="#4F7A52" strokeWidth="0" fill="#4F7A52">
        <path id={frondId} d="M70 60 C 10 40, -30 90, 10 150 C 40 110, 60 90, 110 95 C 80 70, 90 50, 70 60 Z" />
        <use href={`#${frondId}`} transform="rotate(42 70 60)" fillOpacity=".82" />
        <use href={`#${frondId}`} transform="rotate(84 70 60)" fillOpacity=".64" />
        <use href={`#${frondId}`} transform="rotate(126 70 60)" fillOpacity=".46" />
      </g>

      <ellipse cx="236" cy="300" rx="150" ry="36" fill="#2A0E3B" fillOpacity=".18" />

      <path d="M106 210 C 106 170, 164 150, 232 150 C 300 150, 358 170, 358 210 C 358 268, 300 320, 232 320 C 164 320, 106 268, 106 210 Z" fill="#F3E2BE" />
      <path d="M122 214 C 122 182, 172 166, 232 166 C 292 166, 342 182, 342 214 C 342 262, 292 304, 232 304 C 172 304, 122 262, 122 214 Z" fill="#6E2159" />

      <path d="M232 166 C 268 166, 300 174, 318 188 C 300 192, 268 196, 246 214 C 270 220, 292 232, 300 250 C 276 248, 250 246, 232 258 C 214 246, 188 248, 164 250 C 172 232, 194 220, 218 214 C 196 196, 164 192, 146 188 C 164 174, 196 166, 232 166 Z" fill="#9A2E72" />

      <circle cx="196" cy="196" r="12" fill="#D9A43D" />
      <circle cx="268" cy="188" r="9" fill="#F3E2BE" />
      <circle cx="288" cy="222" r="7" fill="#D9A43D" />
      <circle cx="178" cy="232" r="8" fill="#F3E2BE" />
      <path d="M232 178 C 244 178, 254 186, 254 196 C 254 206, 244 212, 232 212 C 220 212, 210 206, 210 196 C 210 186, 220 178, 232 178 Z" fill="#F3E2BE" fillOpacity=".9" />
    </svg>
  )
}
