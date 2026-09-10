import { useEffect, useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import CreateMediaModal from '../components/modals/CreateMediaModal';
import ManageSeasonsModal from '../components/modals/ManageSeasonsModal';
import { Button } from '../components/ui/button';
import { MetalButton } from '../components/ui/MetalButton';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import {
    IconReel, IconFilm, IconTv, IconSpark, IconStar, IconCalendar, IconCheck, IconLogOut, IconPlus,
} from '../components/ui/icons';

const TYPE_META = {
    filme: { label: 'Filme', badge: 'violet', Icon: IconFilm },
    serie: { label: 'Série', badge: 'blue', Icon: IconTv },
    anime: { label: 'Anime', badge: 'emerald', Icon: IconSpark },
};

function formatDate(value) {
    if(!value) return null;
    const d = new Date(value);
    if(Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString('pt-BR');
}

function getInitials(name) {
    return (name || '').trim().slice(0, 2).toUpperCase() || '••';
}

function StatCard({ Icon, label, value, accent }) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-card/70 p-4 transition-colors duration-300 hover:border-purple-500/30">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent}`}>
                <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
                <p className="text-2xl font-bold leading-none text-foreground">{value}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
            </div>
        </div>
    );
}

function MediaCard({ item, onManage }) {
    const meta = TYPE_META[item.type] || TYPE_META.filme;
    const TypeIcon = meta.Icon;
    const isFilm = item.type === 'filme';
    const isWatched = Boolean(item.is_watched);
    const hasCover = Boolean(item.image);
    const rating = Number(item.rating);

    return (
        <Card interactive spotlight className="flex h-full flex-col">
            <div className="relative aspect-[16/10] overflow-hidden">
                {hasCover ? (
                    <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                ) : (
                    <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1c1330] via-[#151020] to-[#0c0a14]">
                        <span className="text-3xl font-extrabold tracking-wide text-white/20">
                            {getInitials(item.name)}
                        </span>
                        <TypeIcon className="absolute h-10 w-10 text-white/10" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" aria-hidden />
                <div className="absolute left-3 top-3">
                    <Badge variant={meta.badge}>{meta.label}</Badge>
                </div>
                {isFilm && isWatched && (
                    <div className="absolute right-3 top-3">
                        <Badge variant="watched"><IconCheck className="h-3 w-3" /> Assistido</Badge>
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="truncate text-lg font-semibold tracking-tight text-foreground" title={item.name}>
                        {item.name}
                    </h3>
                    {rating > 0 && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-xs font-semibold text-amber-300">
                            <IconStar className="h-3.5 w-3.5 fill-current" /> {rating.toFixed(1)}
                        </span>
                    )}
                </div>

                {item.description && (
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                )}

                <div className="mt-auto pt-2">
                    {isFilm ? (
                        isWatched ? (
                            <p className="inline-flex items-center gap-2 rounded-lg border border-purple-500/25 bg-purple-500/10 px-3 py-2 text-xs font-medium text-purple-200">
                                <IconCheck className="h-3.5 w-3.5" />
                                Assistido em {formatDate(item.watched_at) || item.watched_at}
                            </p>
                        ) : (
                            <p className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-muted-foreground">
                                <IconCalendar className="h-3.5 w-3.5" />
                                {formatDate(item.release_date) ? `Lançado em ${formatDate(item.release_date)} · ` : ''}Ainda não assistido
                            </p>
                        )
                    ) : (
                        <Button variant="secondary" className="w-full" onClick={() => onManage(item)}>
                            Gerenciar Temporadas ({item.seasons?.length || 0})
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}

export default function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const [mediaList, setMediaList] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [managingMedia, setManagingMedia] = useState(null);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);

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

    const activeMedia = managingMedia
        ? mediaList.find((m) => m.id === managingMedia.id) ?? managingMedia
        : null;

    const openManage = (item) => {
        setManagingMedia(item);
        setIsManageModalOpen(true);
    };

    const closeManage = () => setIsManageModalOpen(false);

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
                        <span className="hidden h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-bold text-purple-200 md:flex">
                            {getInitials(user?.username)}
                        </span>
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
                        <MetalButton onClick={() => setIsCreateModalOpen(true)}>
                            <IconPlus className="h-4 w-4" /> Adicionar Item
                        </MetalButton>
                    }
                />

                {!loading && mediaList.length > 0 && (
                    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        <StatCard Icon={IconReel} label="Itens" value={mediaList.length} accent="border-purple-500/30 bg-purple-500/15 text-purple-300" />
                        <StatCard Icon={IconFilm} label="Filmes" value={mediaList.filter((m) => m.type === 'filme').length} accent="border-sky-500/30 bg-sky-500/15 text-sky-300" />
                        <StatCard Icon={IconTv} label="Séries" value={mediaList.filter((m) => m.type === 'serie').length} accent="border-emerald-500/30 bg-emerald-500/15 text-emerald-300" />
                        <StatCard Icon={IconSpark} label="Animes" value={mediaList.filter((m) => m.type === 'anime').length} accent="border-violet-500/30 bg-violet-500/15 text-violet-300" />
                        <StatCard Icon={IconCheck} label="Episódios vistos" value={mediaList.reduce((acc, m) => acc + (m.seasons?.reduce((a, s) => a + (s.episodes?.filter((ep) => ep.is_watched).length || 0), 0) || 0), 0)} accent="border-fuchsia-500/30 bg-fuchsia-500/15 text-fuchsia-300" />
                    </div>
                )}

                <div className="mt-8">
                    {loading ? (
                        <LoadingState label="Carregando sua biblioteca..." />
                    ) : mediaList.length === 0 ? (
                        <EmptyState
                            title="Sua lista está vazia"
                            description="Adicione seu primeiro filme, série ou anime para começar a construir sua coleção."
                            action={
                                <MetalButton onClick={() => setIsCreateModalOpen(true)}>
                                    <IconPlus className="h-4 w-4" /> Adicionar item
                                </MetalButton>
                            }
                        />
                    ) : (
                        <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            <AnimatePresence mode="popLayout">
                                {mediaList.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.96 }}
                                        transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4), ease: [0.22, 1, 0.36, 1] }}
                                    >
                                        <MediaCard item={item} onManage={openManage} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </main>

            {/* Modais */}
            <CreateMediaModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchMedia}
            />
            <ManageSeasonsModal
                open={isManageModalOpen}
                media={activeMedia}
                onClose={closeManage}
                onSuccess={fetchMedia}
            />
        </div>
    );
}