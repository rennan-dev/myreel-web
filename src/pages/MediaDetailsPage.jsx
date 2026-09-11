import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { SeasonsSection } from '../components/media/SeasonsSection';
import { resolveCoverUrl } from '../lib/utils';
import { IconArrowLeft, IconFilm, IconTv, IconSpark, IconStar, IconCalendar, IconCheck } from '../components/ui/icons';

const TYPE_META = {
    filme: { label: 'Filme', badge: 'violet', Icon: IconFilm },
    serie: { label: 'Série', badge: 'blue', Icon: IconTv },
    anime: { label: 'Anime', badge: 'emerald', Icon: IconSpark },
};

function formatDate(value) {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString('pt-BR');
}

export default function MediaDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const goBack = () => navigate(-1);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await api.get(`/media/${id}`);
                if (!cancelled) {
                    setItem(res.data);
                    setError('');
                }
            } catch {
                if (!cancelled) setError('Não foi possível carregar este item.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [id]);
    const fetchItem = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/media/${id}`);
            setItem(res.data);
            setError('');
        } catch {
            setError('Não foi possível carregar este item.');
        } finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (
            <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-12 sm:px-6">
                <LoadingState label="Carregando item..." />
            </div>
        );
    }
    if (error || !item) {
        return (
            <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-12 sm:px-6">
                <BackButton onBack={goBack} />
                <EmptyState title="Item não encontrado" description={error || 'Este item não existe.'} />
            </div>
        );
    }
    const meta = TYPE_META[item.type] || TYPE_META.filme;
    const TypeIcon = meta.Icon;
    const coverUrl = resolveCoverUrl(item);
    const rating = Number(item.rating);
    const seasons = item.seasons ?? [];
    const watchedEps = seasons.reduce((a, s) => a + (s.episodes?.filter((e) => e.is_watched).length || 0), 0);
    const totalEps = seasons.reduce((a, s) => a + (s.episodes?.length || 0), 0);
    return (
        <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-12 sm:px-6">
            <BackButton onBack={goBack} />
            <Card className="overflow-hidden">
                <div className="grid gap-0 md:grid-cols-[280px_1fr]">
                    <div className="relative min-h-56 bg-gradient-to-br from-[#1c1330] via-[#151020] to-[#0c0a14]">
                        {coverUrl ? (
                            <img src={coverUrl} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full min-h-56 items-center justify-center">
                                <TypeIcon className="h-12 w-12 text-white/10" />
                            </div>
                        )}
                    </div>
                    <div className="p-5 sm:p-7">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={meta.badge}><TypeIcon className="h-3.5 w-3.5" />{meta.label}</Badge>
                            {!Number.isNaN(rating) && rating > 0 && (
                                <Badge variant="amber"><IconStar className="h-3.5 w-3.5" filled />{rating.toFixed(1)}</Badge>
                            )}
                            {item.type === 'filme' && item.is_watched && (
                                <Badge variant="emerald"><IconCheck className="h-3.5 w-3.5" />Assistido</Badge>
                            )}
                        </div>
                        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{item.name}</h1>
                        {item.description && (<p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>)}
                        {item.type === 'filme' ? (
                            <FilmMeta item={item} />
                        ) : (
                            <p className="mt-3 text-sm text-muted-foreground">{seasons.length} {seasons.length === 1 ? 'temporada' : 'temporadas'} · {watchedEps}/{totalEps} episódios assistidos</p>
                        )}
                    </div>
                </div>
            </Card>
            {item.type !== 'filme' && (
                <div className="mt-6">
                    <h2 className="mb-3 text-lg font-bold text-foreground">Temporadas e episódios</h2>
                    <SeasonsSection media={item} onChanged={fetchItem} />
                </div>
            )}
        </div>
    );
}

function BackButton({ onBack }) {
    return (
        <button type="button" onClick={onBack} aria-label="Voltar" className="mb-4 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-muted-foreground transition-colors hover:border-purple-500/40 hover:text-foreground">
            <IconArrowLeft className="h-5 w-5" />
        </button>
    );
}

function FilmMeta({ item }) {
    return (
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {formatDate(item.release_date) && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1"><IconCalendar className="h-3.5 w-3.5" />{formatDate(item.release_date)}</span>
            )}
            {item.is_watched && formatDate(item.watched_at) && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1"><IconCheck className="h-3.5 w-3.5" />Visto em {formatDate(item.watched_at)}</span>
            )}
        </div>
    );
}