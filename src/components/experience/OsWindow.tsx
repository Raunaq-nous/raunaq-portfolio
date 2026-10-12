'use client';

import { useRef, useState, type ReactNode } from 'react';

export interface Slot {
  left: number;
  top: number;
  width: number;
}

/**
 * A draggable system window. On desktop it sits at `slot` (percent of the stage) and can be
 * dragged anywhere by its title bar; "pull out" expands it into a reading view.
 */
export default function OsWindow({
  title,
  meta,
  slot,
  index,
  z,
  onFocus,
  onExpand,
  dark = false,
  static: isStatic = false,
  children,
}: {
  title: string;
  meta?: string;
  slot: Slot;
  index: number;
  z: number;
  onFocus: () => void;
  onExpand: () => void;
  dark?: boolean;
  /** Static windows sit in normal flow and cannot be dragged. */
  static?: boolean;
  children: ReactNode;
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const down = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (isStatic || window.matchMedia('(max-width: 1023px)').matches) return;
    onFocus();
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    setOffset({ x: d.ox + e.clientX - d.x, y: d.oy + e.clientY - d.y });
  };
  const up = () => {
    drag.current = null;
  };

  return (
    <section
      className={`os-window relative w-full ${isStatic ? "" : "lg:absolute"}`}
      style={
        {
          '--l': `${slot.left}%`,
          '--t': `${slot.top}%`,
          '--w': `${slot.width}%`,
          '--dx': `${offset.x}px`,
          '--dy': `${offset.y}px`,
          zIndex: z,
          animationDelay: `${120 + index * 130}ms`,
        } as React.CSSProperties
      }
      onPointerDown={onFocus}
      aria-label={title}
    >
      <div className={`flex h-full flex-col border border-paper/25 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] ${dark ? 'bg-ink' : 'bg-ink-2'}`}>
        <header
          className="flex cursor-grab touch-none select-none items-center gap-3 border-b border-paper/15 bg-ink-3 px-3 py-2 active:cursor-grabbing"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        >
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2 w-2 border border-paper/40" />
            <span className="h-2 w-2 border border-paper/40" />
            <span className="h-2 w-2 bg-paper/60" />
          </span>
          <span className="label min-w-0 flex-1 truncate normal-case tracking-normal text-grey-1">{title}</span>
          {meta && <span className="label hidden text-grey-3 xl:inline">{meta}</span>}
          <button type="button" onClick={onExpand} className="label text-grey-2 hover:text-paper" aria-label={`Pull out ${title}`}>
            ⤢
          </button>
        </header>
        <div className={`thin-scroll max-h-[46vh] overflow-y-auto p-4 text-[13px] leading-relaxed text-grey-1 ${isStatic ? 'lg:max-h-[62vh]' : 'lg:max-h-[28vh]'}`}>{children}</div>
      </div>
    </section>
  );
}
