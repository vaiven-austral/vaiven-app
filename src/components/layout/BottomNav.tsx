import { NavLink, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

const iconProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const navItems: NavItem[] = [
  {
    to: '/',
    label: 'Inicio',
    icon: (
      <svg {...iconProps}>
        <path d="M4 10.5 12 4l8 6.5" />
        <path d="M6 9.5V19a1 1 0 0 0 1 1h3v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5h3a1 1 0 0 0 1-1V9.5" />
      </svg>
    ),
  },
  {
    to: '/mis-donaciones',
    label: 'Movimientos',
    icon: (
      <svg {...iconProps}>
        <path d="M9 11 5 15l4 4" />
        <path d="M5 15h9a5 5 0 0 0 0-10" />
      </svg>
    ),
  },
  {
    to: '/historial',
    label: 'Historial',
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 8v4l2.5 2" />
      </svg>
    ),
  },
  {
    to: '/perfil',
    label: 'Perfil',
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 19.5c1.2-3.2 3.9-5 7-5s5.8 1.8 7 5" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="relative grid h-[84px] grid-cols-[1fr_1fr_72px_1fr_1fr] items-center border-t border-borde bg-tarjeta px-4 pb-2">
      {navItems.slice(0, 2).map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center gap-[5px] pt-1 text-[10px] font-bold leading-none tracking-normal ${isActive ? 'text-secundario' : 'text-texto-suave'}`}
          >
            <span
              className={`flex h-[26px] w-[42px] items-center justify-center rounded-boton ${
                isActive ? 'bg-[#21686917] text-secundario' : 'text-texto-suave'
              }`}
            >
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        );
      })}

      <div aria-hidden="true" />

      {navItems.slice(2).map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center gap-[5px] pt-1 text-[10px] font-bold leading-none tracking-normal ${isActive ? 'text-secundario' : 'text-texto-suave'}`}
          >
            <span
              className={`flex h-[26px] w-[42px] items-center justify-center rounded-boton ${
                isActive ? 'bg-[#21686917] text-secundario' : 'text-texto-suave'
              }`}
            >
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        );
      })}

      <NavLink
        to="/publicar"
        aria-label="Nueva publicación"
        className="absolute left-1/2 top-0 flex h-[62px] w-[62px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill border-[5px] border-tarjeta bg-primario text-tarjeta shadow-[0_10px_22px_rgba(73,160,120,0.42)]"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </NavLink>
    </nav>
  );
}
