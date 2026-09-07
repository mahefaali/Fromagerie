interface WvcLogoProps {
  className?: string;
  style?: React.CSSProperties;
}

export function WvcLogo({ className = 'h-10 w-auto', style }: WvcLogoProps) {
  return (
    <img
      src="/favicon.svg"
      alt="Logo de la Fromagerie Artisanale"
      className={className}
      style={style}
      data-wvc-role="logo"
    />
  );
}
