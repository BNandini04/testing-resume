export function PaymentIllustration() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 300 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="max-w-full h-auto"
    >
      {/* Credit card */}
      <rect x="70" y="60" width="160" height="100" rx="10" className="fill-primary/20 stroke-primary" strokeWidth="2" />
      <rect x="85" y="80" width="40" height="10" rx="2" className="fill-primary/30" />
      <rect x="85" y="100" width="130" height="10" rx="2" className="fill-background/80" />
      <rect x="85" y="120" width="60" height="10" rx="2" className="fill-background/80" />
      <rect x="155" y="120" width="30" height="10" rx="2" className="fill-background/80" />

      {/* Security elements */}
      <circle cx="210" cy="90" r="15" className="fill-primary/10 stroke-primary" strokeWidth="1.5" />
      <path d="M210 85 L210 92 M210 95 L210 95.1" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />

      {/* Sparkles */}
      <path d="M50 70 L60 70 M55 65 L55 75" className="stroke-primary" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M240 140 L250 140 M245 135 L245 145"
        className="stroke-primary"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M60 130 L70 130 M65 125 L65 135" className="stroke-primary" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

