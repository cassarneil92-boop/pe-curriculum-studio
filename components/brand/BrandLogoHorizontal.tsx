import Image from "next/image";
import { BRAND_PATHS } from "@/lib/brand/constants";

interface BrandLogoHorizontalProps {
  className?: string;
  height?: number;
  priority?: boolean;
}

export function BrandLogoHorizontal({
  className = "",
  height = 40,
  priority = false,
}: BrandLogoHorizontalProps) {
  return (
    <Image
      src={BRAND_PATHS.logoHorizontal}
      alt="PE Curriculum Studio"
      width={Math.round(height * 4.2)}
      height={height}
      priority={priority}
      className={`h-auto w-auto max-w-full object-contain object-left ${className}`}
      style={{ maxHeight: height }}
    />
  );
}
