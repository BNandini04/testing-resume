export function UploadIllustration() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 300 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="max-w-full h-auto"
    >
      <rect x="75" y="25" width="150" height="150" rx="8" className="fill-background stroke-border" strokeWidth="2" />

      {/* Upload cloud */}
      <circle cx="150" cy="85" r="40" className="fill-primary/10" />
      <path
        d="M150 60 L150 110 M130 80 L150 60 L170 80"
        className="stroke-primary"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Document lines */}
      <rect x="110" y="120" width="80" height="6" rx="2" className="fill-muted-foreground" />
      <rect x="120" y="135" width="60" height="5" rx="2" className="fill-muted-foreground/70" />
      <rect x="130" y="150" width="40" height="5" rx="2" className="fill-muted-foreground/50" />
    </svg>
  )
}

