'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  /** Tailwind classes for the option pill / badge (e.g. colored statuses) */
  className?: string;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  /** Extra classes for the trigger button wrapper */
  className?: string;
  /** Optional icon rendered at the left of the trigger */
  icon?: React.ReactNode;
  /** sm = compact inline (table cells), md = normal form field */
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export const Select = ({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar…',
  className = '',
  icon,
  size = 'md',
  disabled = false,
}: SelectProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; minWidth: number }>({ top: 0, left: 0, minWidth: 0 });

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        minWidth: rect.width,
      });
    }
  }, []);

  /* recalculate position on open and on scroll/resize */
  useEffect(() => {
    if (!open) return;
    updatePosition();
    const handleReposition = () => updatePosition();
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);
    return () => {
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [open, updatePosition]);

  /* close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  /* close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const selected = options.find(o => o.value === value);

  const sizeStyles = size === 'sm'
    ? 'text-[11px] px-2.5 py-1 rounded-full font-semibold'
    : 'text-sm px-4 py-2.5 rounded-lg';

  const dropdown = open ? createPortal(
    <div
      style={{
        position: 'fixed',
        top: dropdownPos.top,
        left: dropdownPos.left,
        minWidth: dropdownPos.minWidth,
        zIndex: 9999,
      }}
      className={`max-h-60 overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg ${size === 'sm' ? 'w-auto' : 'w-max'}`}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onChange(opt.value); setOpen(false); }}
            className={`
              w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer whitespace-nowrap
              ${isActive ? 'bg-purple-50 text-purple-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}
            `}
          >
            {opt.className ? (
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${opt.className}`}>
                {opt.label}
              </span>
            ) : (
              opt.label
            )}
          </button>
        );
      })}
    </div>,
    document.body
  ) : null;

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      {/* Trigger */}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        className={`
          inline-flex items-center gap-1.5 border transition-all cursor-pointer select-none
          focus:outline-none focus:ring-2 focus:ring-purple-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeStyles}
          ${selected?.className
            ? selected.className
            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
          }
        `}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown via portal */}
      {dropdown}
    </div>
  );
};
