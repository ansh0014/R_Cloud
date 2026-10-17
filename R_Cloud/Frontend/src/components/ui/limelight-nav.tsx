import React, { useState, useRef, useLayoutEffect, cloneElement } from 'react';

// --- Internal Types and Defaults ---

const DefaultHomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);

const DefaultCompassIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
  </svg>
);

const DefaultBellIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

export type NavItem = {
  id: string | number;
  icon: React.ReactElement<{ className?: string }>;
  label?: string;
  onClick?: () => void;
};

const defaultNavItems: NavItem[] = [
  { id: 'default-home', icon: <DefaultHomeIcon />, label: 'Home' },
  { id: 'default-explore', icon: <DefaultCompassIcon />, label: 'Explore' },
  { id: 'default-notifications', icon: <DefaultBellIcon />, label: 'Notifications' },
];

export type LimelightNavProps = {
  items?: NavItem[];
  defaultActiveIndex?: number;
  activeIndex?: number;
  onTabChange?: (index: number) => void;
  className?: string;
  limelightClassName?: string;
  iconContainerClassName?: string;
  iconClassName?: string;
  showLabels?: boolean;
};

/**
 * An adaptive-width navigation bar with a "limelight" effect that highlights the active item.
 */
export const LimelightNav = ({
  items = defaultNavItems,
  defaultActiveIndex = 0,
  activeIndex: controlledIndex,
  onTabChange,
  className = '',
  limelightClassName = '',
  iconContainerClassName = '',
  iconClassName = '',
  showLabels = false,
}: LimelightNavProps) => {
  const [internalIndex, setInternalIndex] = useState(defaultActiveIndex);
  const activeIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;

  const [isReady, setIsReady] = useState(false);
  const navItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const limelightRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (items.length === 0) return;

    const limelight = limelightRef.current;
    const activeItem = navItemRefs.current[activeIndex];

    if (limelight && activeItem) {
      const newLeft = activeItem.offsetLeft + activeItem.offsetWidth / 2 - limelight.offsetWidth / 2;
      limelight.style.left = `${newLeft}px`;

      if (!isReady) {
        setTimeout(() => setIsReady(true), 50);
      }
    }
  }, [activeIndex, isReady, items]);

  if (items.length === 0) {
    return null;
  }

  const handleItemClick = (index: number, itemOnClick?: () => void) => {
    if (controlledIndex === undefined) {
      setInternalIndex(index);
    }
    onTabChange?.(index);
    itemOnClick?.();
  };

  return (
    <nav
      className={`relative inline-flex items-center h-12 rounded-xl bg-[#0e0e11]/95 text-foreground border border-white/10 px-2 shadow-2xl backdrop-blur-xl ${className}`}
    >
      {items.map(({ id, icon, label, onClick }, index) => {
        const isCurrentActive = activeIndex === index;
        return (
          <a
            key={id}
            ref={(el) => {
              navItemRefs.current[index] = el;
            }}
            title={label}
            className={`relative z-20 flex h-full cursor-pointer items-center justify-center px-3.5 sm:px-4.5 select-none no-underline gap-1.5 transition-colors ${iconContainerClassName}`}
            onClick={() => handleItemClick(index, onClick)}
            aria-label={label}
          >
            {cloneElement(icon as React.ReactElement<{ className?: string }>, {
              className: `w-5 h-5 transition-all duration-200 ease-in-out ${
                isCurrentActive
                  ? 'opacity-100 text-white scale-105 drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]'
                  : 'opacity-40 hover:opacity-75 text-neutral-400'
              } ${(icon.props as { className?: string })?.className || ''} ${iconClassName}`,
            })}
            {showLabels && label && (
              <span
                className={`font-manrope font-semibold text-xs transition-colors duration-200 ${
                  isCurrentActive ? 'text-white opacity-100' : 'text-neutral-400 opacity-60 hover:opacity-90'
                }`}
              >
                {label}
              </span>
            )}
          </a>
        );
      })}

      {/* Limelight spotlight beam */}
      <div
        ref={limelightRef}
        className={`absolute top-0 z-10 w-10 h-[3px] rounded-full bg-white shadow-[0_0_8px_#ffffff,0_0_18px_rgba(255,255,255,0.8)] ${
          isReady ? 'transition-[left] duration-300 ease-out' : ''
        } ${limelightClassName}`}
        style={{ left: '-999px' }}
      >
        <div className="absolute left-[-45%] top-[3px] w-[190%] h-11 [clip-path:polygon(10%_100%,28%_0,72%_0,90%_100%)] bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none" />
      </div>
    </nav>
  );
};
