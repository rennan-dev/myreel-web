import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const MIN_SCALE = 1;
const MAX_SCALE = 4;

/**
 * Mantém o enquadramento válido: o deslocamento máximo (em % do quadro)
 * é metade do excesso gerado pelo zoom, evitando "buracos" nas bordas.
 */
function clampCoverValue({ x, y, scale }) {
    const s = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number(scale) || 1));
    const max = ((s - 1) / 2) * 100;
    return {
        scale: s,
        x: Math.min(max, Math.max(-max, Number(x) || 0)),
        y: Math.min(max, Math.max(-max, Number(y) || 0)),
    };
}

/**
 * Editor de capa: quadro com proporção fixa onde a imagem pode ser
 * arrastada (posicionar) e ampliada/reduzida (zoom) pelo usuário.
 */
export function CoverEditor({ src, value, onChange, className }) {
    const frameRef = useRef(null);
    const dragRef = useRef(null);
    const valueRef = useRef(value);
    const [dragging, setDragging] = useState(false);

    // espelha o valor atual em uma ref para uso nos handlers (roda, drag)
    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    const commit = (next) => onChange?.(clampCoverValue(next));

    const handlePointerDown = (e) => {
        if (!src) return;
        e.preventDefault();
        dragRef.current = {
            pointerId: e.pointerId,
            startX: e.clientX,
            startY: e.clientY,
            start: { ...valueRef.current },
        };
        frameRef.current?.setPointerCapture?.(e.pointerId);
        setDragging(true);
    };

    const handlePointerMove = (e) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== e.pointerId) return;
        const rect = frameRef.current?.getBoundingClientRect();
        if (!rect || !rect.width || !rect.height) return;
        const dxPct = ((e.clientX - drag.startX) / rect.width) * 100;
        const dyPct = ((e.clientY - drag.startY) / rect.height) * 100;
        commit({ ...drag.start, x: drag.start.x + dxPct, y: drag.start.y + dyPct });
    };

    const endDrag = (e) => {
        if (dragRef.current?.pointerId !== e.pointerId) return;
        dragRef.current = null;
        setDragging(false);
    };

    // zoom pela roda do mouse (listener não passivo para poder cancelar o scroll)
    useEffect(() => {
        const frame = frameRef.current;
        if (!frame) return undefined;
        const handleWheel = (e) => {
            if (!src) return;
            e.preventDefault();
            const current = valueRef.current;
            const step = e.deltaY > 0 ? -0.1 : 0.1;
            onChange?.(clampCoverValue({ ...current, scale: (Number(current.scale) || 1) + step }));
        };
        frame.addEventListener('wheel', handleWheel, { passive: false });
        return () => frame.removeEventListener('wheel', handleWheel);
    }, [src, onChange]);

    const { x, y, scale } = value;

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <div
                ref={frameRef}
                role="application"
                aria-label="Editor de capa: arraste para posicionar e ajuste o zoom"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                className={cn(
                    'relative aspect-[2/3] w-52 touch-none overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#1c1330] via-[#151020] to-[#0c0a14]',
                    src && (dragging ? 'cursor-grabbing' : 'cursor-grab'),
                )}
            >
                {src ? (
                    <img
                        src={src}
                        alt="Prévia da capa"
                        draggable={false}
                        className="pointer-events-none absolute left-1/2 top-1/2 h-full w-full select-none object-cover"
                        style={{ transform: `translate(-50%, -50%) translate(${x}%, ${y}%) scale(${scale})` }}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center p-4 text-center text-xs text-muted-foreground">
                        Selecione uma imagem para visualizar e ajustar a capa.
                    </div>
                )}
            </div>
            <div className="flex w-52 items-center gap-2">
                <span className="shrink-0 text-xs text-muted-foreground">Zoom</span>
                <input
                    type="range"
                    min={MIN_SCALE}
                    max={MAX_SCALE}
                    step="0.01"
                    value={scale}
                    onChange={(e) => commit({ ...valueRef.current, scale: Number(e.target.value) })}
                    className="w-full cursor-pointer accent-purple-500"
                    aria-label="Zoom da capa"
                />
            </div>
            <div className="flex w-52 items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">Arraste para mover.</p>
                <Button type="button" variant="ghost" size="xs" onClick={() => commit({ x: 0, y: 0, scale: 1 })}>
                    Redefinir
                </Button>
            </div>
        </div>
    );
}
