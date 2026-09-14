import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { Button } from '../components/ui/button';
import { MetalButton } from '../components/ui/MetalButton';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { CoverImage } from '../components/media/CoverImage';
import {
    IconReel, IconFilm, IconTv, IconSpark, IconStar, IconCheck, IconLogOut, IconPlus,
} from '../components/ui/icons';

const TYPE_META = {
    filme: { label: 'Filme', badge: 'violet', Icon: IconFilm },
    serie: { label: 'Série', badge: 'blue', Icon: IconTv },
    anime: { label: 'Anime', badge: 'emerald', Icon: IconSpark },
};

function getInitials(name) {
    return (name || '').trim().slice(0, 2).toUpperCase() || '••';
}

function StatCard({ Icon, label, value, accent, onClick, active = false }) {
    const clickable = typeof onClick === 'function';
    return (
        <button
            type="button"
            onClick={clickable ? onClick : undefined}
            title={clickable ? `Mostrar apenas ${label.toLowerCase()}` : undefined}
            className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors duration-300 ${active ? 'cursor-pointer border-purple-500/50 bg-purple-500/10 shadow-glow' : 'border-white/8 bg-card/70'} ${clickable && !active ? 'cursor-pointer hover:border-purple-500/30' : ''}`}
        >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent}`}>
                <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
                <p className="text-2xl font-bold leading-none text-foreground">{value}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
            </div>
        </button>
    );
}

function MediaCard({ item }) {
    const navigate = useNavigate();
    const meta = TYPE_META[item.type] || TYPE_META.filme;
    const TypeIcon = meta.Icon;
    const isFilm = item.type === 'filme';
    const isWatched = Boolean(item.is_watched);
    const rating = Number(item.rating);

    return (
        <Card
            interactive
            spotlight
            className="flex h-full cursor-pointer flex-col"
            role="link"
            tabIndex={0}
            aria-label={`Abrir ${item.name}`}
            onClick={() => navigate(`/media/${item.id}`)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/media/${item.id}`); } }}
        >
            <CoverImage
                item={item}
                alt={item.name}
                aspect="aspect-[2/3]"
                className="w-full"
                fallback={(
                    <div className="relative flex h-full w-full items-center justify-center">
                        <span className="text-3xl font-extrabold tracking-wide text-white/20">
                            {getInitials(item.name)}
                        </span>
                        <TypeIcon className="absolute h-10 w-10 text-white/10" />
                    </div>
                )}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" aria-hidden />
                <div className="absolute left-3 top-3">
                    <Badge variant={meta.badge}>{meta.label}</Badge>
                </div>
                {isFilm && isWatched && (
                    <div className="absolute right-3 top-3">
                        <Badge variant="watched"><IconCheck className="h-3 w-3" /> Assistido</Badge>
                    </div>
                )}
            </CoverImage>

            <div className="flex flex-1 flex-col gap-2 p-3 sm:gap-3 sm:p-5">
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                    <h3 className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-xl" title={item.name}>
                        {item.name}
                    </h3>
                    {rating > 0 && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-xs font-semibold text-amber-300">
                            <IconStar className="h-3.5 w-3.5 fill-current" /> {rating.toFixed(1)}
                        </span>
                    )}
                </div>

                {item.description && (
                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">{item.description}</p>
                )}
            </div>
        </Card>
    );
}

export default function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [mediaList, setMediaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('todos');

    const toggleFilter = (type) => setFilter((prev) => (prev === type ? 'todos' : type));
    const filteredList = filter === 'todos' ? mediaList : mediaList.filter((m) => m.type === filter);

    const fetchMedia = () => {
        api.get('/media')
            .then((response) => {
                setMediaList(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchMedia();
    }, []);

    const goCreate = () => navigate('/novo');

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-white/8 bg-background/75 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 text-white shadow-glow">
                            <IconReel className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 leading-tight">
                            <p className="truncate text-sm font-bold tracking-tight text-foreground">MyReel</p>
                            <p className="truncate text-xs text-muted-foreground">Sua coleção pessoal</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={logout} aria-label="Sair da conta" title="Sair">
                            <IconLogOut className="h-[18px] w-[18px]" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
                <PageHeader
                    eyebrow="Minha Biblioteca"
                    title={`Olá, ${user?.username}`}
                    description="Gerencie seus filmes, séries e animes em um só lugar."
                    actions={
                        <MetalButton onClick={goCreate}>
                            <IconPlus className="h-4 w-4" /> Adicionar Item
                        </MetalButton>
                    }
                />

                {!loading && mediaList.length > 0 && (
                    <div className="mt-8 grid grid-cols-3 gap-3">
                        <StatCard Icon={IconFilm} label="Filmes" value={mediaList.filter((m) => m.type === 'filme').length} accent="border-sky-500/30 bg-sky-500/15 text-sky-300" onClick={() => toggleFilter('filme')} active={filter === 'filme'} />
                        <StatCard Icon={IconTv} label="Séries" value={mediaList.filter((m) => m.type === 'serie').length} accent="border-emerald-500/30 bg-emerald-500/15 text-emerald-300" onClick={() => toggleFilter('serie')} active={filter === 'serie'} />
                        <StatCard Icon={IconSpark} label="Animes" value={mediaList.filter((m) => m.type === 'anime').length} accent="border-violet-500/30 bg-violet-500/15 text-violet-300" onClick={() => toggleFilter('anime')} active={filter === 'anime'} />
                    </div>
                )}

                {filter !== 'todos' && mediaList.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                        Mostrando apenas {TYPE_META[filter].label.toLowerCase() === 'série' ? 'séries' : `${TYPE_META[filter].label.toLowerCase()}s`} — clique no card novamente para ver tudo.
                    </p>
                )}

                <div className="mt-8">
                    {loading ? (
                        <LoadingState label="Carregando sua biblioteca..." />
                    ) : filteredList.length === 0 ? (
                        <EmptyState
                            title={mediaList.length === 0 ? 'Sua lista está vazia' : 'Nada por aqui'}
                            description={mediaList.length === 0 ? 'Adicione seu primeiro filme, série ou anime para começar a construir sua coleção.' : 'Você ainda não adicionou itens desse tipo.'}
                            action={
                                <MetalButton onClick={goCreate}>
                                    <IconPlus className="h-4 w-4" /> Adicionar item
                                </MetalButton>
                            }
                        />
                    ) : (
                        <motion.div layout className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                            <AnimatePresence mode="popLayout">
                                {filteredList.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.96 }}
                                        transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4), ease: [0.22, 1, 0.36, 1] }}
                                    >
                                        <MediaCard item={item} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}