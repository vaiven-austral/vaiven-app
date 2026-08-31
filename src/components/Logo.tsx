import { Link } from 'react-router-dom';
import logo from '../assets/Logo_Vaiven1.webp';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeMap = {
    sm: 'h-12',
    md: 'h-20',
    lg: 'h-32',
  };

  return (
    <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
      <img
        src={logo}
        alt="VaiVen"
        className={`${sizeMap[size]} ${className}`}
      />
    </Link>
  );
}
