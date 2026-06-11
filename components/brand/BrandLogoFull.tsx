import Image from "next/image";
import { BRAND_PATHS } from "@/lib/brand/constants";

interface BrandLogoFullProps {
  className?: string;
  priority?: boolean;
}

export function BrandLogoFull({ className = "", priority = false }: BrandLogoFullProps) {
  return (
    <Image
      src={BRAND_PATHS.logoFull}
      alt="PE Curriculum Studio"
      width={480}
      height={320}
      priority={priority}
      className={`h-auto w-full max-w-md object-contain ${className}`}
    />
  );
}
