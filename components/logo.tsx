import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: number
  variant?: "default" | "simple"
}

export function Logo({ className, size = 32, variant = "default" }: LogoProps) {
  return (
    <div className={cn("relative", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-colors"
      >
        {/* Base document with gradient */}
        <defs>
          <linearGradient id="documentGradient" x1="8" y1="4" x2="24" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="hsl(var(--primary)/0.2)" />
            <stop offset="1" stopColor="hsl(var(--primary)/0.1)" />
          </linearGradient>
          <linearGradient id="checkGradient" x1="19" y1="19" x2="26" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="hsl(var(--primary))" />
            <stop offset="1" stopColor="hsl(var(--primary)/0.8)" />
          </linearGradient>
          <filter
            id="shadow"
            x="-1"
            y="-1"
            width="34"
            height="34"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="1" />
            <feGaussianBlur stdDeviation="1" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
          </filter>
        </defs>

        {/* Document base with shadow and gradient */}
        <g filter="url(#shadow)">
          <path
            d="M22 4H10C8.89543 4 8 4.89543 8 6V26C8 27.1046 8.89543 28 10 28H22C23.1046 28 24 27.1046 24 26V6C24 4.89543 23.1046 4 22 4Z"
            fill="url(#documentGradient)"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Document lines with subtle animation */}
        <path
          d="M12 10H20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-700 ease-in-out"
        />
        <path
          d="M12 14H20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-700 ease-in-out delay-100"
        />
        <path
          d="M12 18H16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-700 ease-in-out delay-200"
        />

        {/* Checkmark/Tailor element with gradient */}
        <path
          d="M19 22L21 24L26 19"
          stroke="url(#checkGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />

        {/* Pen/tailor element */}
        <g className="transition-transform duration-500 hover:translate-x-0.5 hover:-translate-y-0.5">
          <path
            d="M5 10L7 8L9 10L7 12L5 10Z"
            fill="hsl(var(--primary))"
            stroke="hsl(var(--primary))"
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
          <path d="M7 12L7 20" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="7" cy="22" r="2" fill="hsl(var(--primary)/0.7)" stroke="hsl(var(--primary))" strokeWidth="0.5" />
        </g>
      </svg>
    </div>
  )
}

