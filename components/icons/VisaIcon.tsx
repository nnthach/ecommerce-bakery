interface VisaIconProps {
  className?: string;
}

export default function VisaIcon({ className }: VisaIconProps) {
  return (
    <svg
      viewBox="0 0 48 32"
      className={className}
      role="img"
      aria-label="Visa"
    >
      <rect width="48" height="32" rx="4" fill="#1A1F71" />
      <text
        x="24"
        y="21"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontWeight="bold"
        fontSize="13"
        fill="#FFFFFF"
      >
        VISA
      </text>
    </svg>
  );
}
