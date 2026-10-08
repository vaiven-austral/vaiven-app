import type { LucideProps, LucideIcon } from 'lucide-react';

export interface IconProps extends LucideProps {
  icon: LucideIcon;
}

export function Icon({ icon: IconComponent, 'aria-hidden': ariaHidden = true, ...props }: IconProps) {
  return <IconComponent aria-hidden={ariaHidden} {...props} />;
}
