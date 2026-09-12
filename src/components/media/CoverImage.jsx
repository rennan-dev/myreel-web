import { cn, resolveCoverUrl } from '../../lib/utils';

/**
 * Capa com proporção fixa (não estica): aplica a posição/zoom salvos
 * pelo editor (cover_x, cover_y, cover_scale) via transform.
 * `src` sobrepõe o item; `fallback` aparece quando não há capa.
 */
export function CoverImage({ item, src, alt = '', aspect = 'aspect-[2/3]', className, imgClassName, fallback = null, children }) {
    const url = src ?? resolveCoverUrl(item);
    const x = Number(item?.cover_x) || 0;
    const y = Number(item?.cover_y) || 0;
    const scale = Number(item?.cover_scale) || 1;

    return (
        <div className={cn('relative overflow-hidden bg-gradient-to-br from-[#1c1330] via-[#151020] to-[#0c0a14]', aspect, className)}>
            {url ? (
                <img
                    src={url}
                    alt={alt}
                    loading="lazy"
                    draggable={false}
                    className={cn('absolute left-1/2 top-1/2 h-full w-full object-cover', imgClassName)}
                    style={{ transform: `translate(-50%, -50%) translate(${x}%, ${y}%) scale(${scale})` }}
                />
            ) : (
                fallback
            )}
            {children}
        </div>
    );
}
