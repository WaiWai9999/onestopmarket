interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  // textColor no longer used; logo is standalone image
}


export default function Logo({ size = 'md' }: LogoProps) {
  // much larger sizes for better visibility
  const iconH = size === 'sm' ? 75 : size === 'lg' ? 225 : 150;
  const iconW = Math.round(iconH * (210 / 150));

  return (
    <div className="inline-block">
      {/* standalone logo image */}
      <img
        src="/file2.svg"
        width={iconW}
        height={iconH}
        alt="OneStopMarket logo"
        className="block object-contain"
      />
    </div>
  );
}
