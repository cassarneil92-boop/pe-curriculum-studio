import Image from "next/image";
import { BRAND_PATHS } from "@/lib/brand/constants";

interface BrandIconProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

export function BrandIcon({ size = 40, className = "", priority = false }: BrandIconProps) {
  return (
    <Image
      src={BRAND_PATHS.icon}
      alt="PE Curriculum Studio"
      width={size}
      height={size}
      priority={priority}
      className={`rounded-xl object-contain ${className}`}
    />
  );
}
