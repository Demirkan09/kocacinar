'use client';

import * as React from 'react';

export interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked = false, onCheckedChange, className = '', ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange?.(!checked)}
        className={`
          inline-flex h-[calc(var(--thumb-size)+2px)] w-[calc(var(--thumb-size)*2-2px)] 
          shrink-0 items-center rounded-full p-px outline-none transition-[background-color,box-shadow] 
          duration-200 focus-visible:ring-2 focus-visible:ring-[#D4A373] focus-visible:ring-offset-1 
          disabled:cursor-not-allowed disabled:opacity-64 
          [--thumb-size:20px] sm:[--thumb-size:16px]
          ${checked ? 'bg-[#5e0d0f]' : 'bg-[#E5E5E5]'}
          ${className}
        `}
        ref={ref}
        {...props}
      >
        <span
          className={`
            pointer-events-none block aspect-square h-full origin-left 
            active:not-disabled:scale-x-110 active:rounded-[var(--thumb-size)/calc(var(--thumb-size)*1.1)]
            rounded-[var(--thumb-size)] bg-white shadow-sm will-change-transform 
            [transition:translate_.15s,border-radius_.15s,scale_.1s_.1s,transform-origin_.15s]
            ${checked ? 'origin-[var(--thumb-size)_50%] translate-x-[calc(var(--thumb-size)-4px)]' : 'translate-x-[2px]'}
          `}
        />
      </button>
    );
  }
);

Switch.displayName = 'Switch';
