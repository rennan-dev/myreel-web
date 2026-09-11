import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { SeasonsSection } from '../components/media/SeasonsSection';
import { resolveCoverUrl } from '../lib/utils';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { Checkbox } from '../components/ui/Checkbox';
import { Button } from '../components/ui/button';
import { IconArrowLeft, IconFilm, IconTv, IconSpark, IconStar, IconCalendar, IconCheck, IconPencil, IconTrash } from '../components/ui/icons';

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
    const [editing, setEditing] = useState(false);
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
            <div className="mb-4 flex items-center justify-between">
                <BackButton onBack={goBack} />
                {!editing && (
                    <button type="button" onClick={() => setEditing(true)} aria-label="Editar item" title="Editar item" className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-muted-foreground transition-colors hover:border-purple-500/40 hover:text-foreground">
                        <IconPencil className="h-5 w-5" />
                    </button>
                )}
            </div>
            {editing ? (
                <EditMediaForm
                    item={item}
                    onChanged={fetchItem}
                    onCancel={() => setEditing(false)}
                    onSaved={(fresh) => { setItem(fresh); setEditing(false); }}
                    onDeleted={() => navigate('/', { replace: true })}
                />
            ) : (
                <>
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
                    <SeasonsSection media={item} onChanged={fetchItem} editable={false} />
                </div>
            )}
                </>
            )}
        </div>
    );
}

/**
 * Modo de edição da mídia: formulário + temporadas editáveis,
 * botões Cancelar/Salvar e Excluir. Datas de filme só quando type=filme.
 */
function EditMediaForm({ item, onChanged, onCancel, onSaved, onDeleted }) {
    const isFilm = item.type === 'filme';
    const [name, setName] = useState(item.name);
    const [rating, setRating] = useState(item.rating != null ? String(item.rating) : '');
    const [description, setDescription] = useState(item.description ?? '');
    const [releaseDate, setReleaseDate] = useState(item.release_date ? String(item.release_date).slice(0, 10) : '');
    const [isWatched, setIsWatched] = useState(Boolean(item.is_watched));
    const [watchedAt, setWatchedAt] = useState(item.watched_at ? String(item.watched_at).slice(0, 10) : '');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [formError, setFormError] = useState('');

    const handleFileChange = (e) => {
        const selected = e.target.files?.[0];
        setFormError('');
        if (!selected) {
            setFile(null);
            setPreview(null);
            return;
        }
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(selected.type)) {
            setFormError('Selecione apenas imagens (JPG, PNG, WebP ou GIF).');
            e.target.value = '';
            return;
        }
        if (selected.size > 4 * 1024 * 1024) {
            setFormError('A imagem deve ter no máximo 4MB.');
            e.target.value = '';
            return;
        }
        setFile(selected);
        setPreview(URL.createObjectURL(selected));
    };

    const clearFile = () => {
        setFile(null);
        setPreview(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setFormError('');
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append('_method', 'PUT'); // multipart não envia PUT nativo: method spoofing
            fd.append('name', name);
            if (rating) fd.append('rating', rating);
            fd.append('description', description);
            if (file) fd.append('image', file);
            if (isFilm) {
                if (releaseDate) fd.append('release_date', releaseDate);
                fd.append('is_watched', isWatched ? '1' : '0');
                if (isWatched) fd.append('watched_at', watchedAt);
            }
            const res = await api.post(`/media/${item.id}`, fd);
            onSaved(res.data);
        } catch (err) {
            setFormError(err.response?.data?.message || 'Erro ao salvar as alterações.');
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const ok = window.confirm(`Excluir "${item.name}" e todas as temporadas/episódios dele?`);
        if (!ok) return;
        setFormError('');
        setDeleting(true);
        try {
            await api.delete(`/media/${item.id}`);
            onDeleted();
        } catch {
            setFormError('Erro ao excluir o item.');
            setDeleting(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <form id="edit-media-form" onSubmit={handleSave}>
                <Card className="flex flex-col gap-4 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Editando {isFilm ? 'filme' : item.type === 'serie' ? 'série' : 'anime'}
                    </p>
                    <div>
                        <Label htmlFor="edit-name">Nome</Label>
                        <Input id="edit-name" type="text" required value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="edit-rating">Nota (1 a 5)</Label>
                        <Input
                            id="edit-rating"
                            type="number"
                            step="0.1"
                            min="1"
                            max="5"
                            placeholder="Ex.: 4.5"
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="edit-cover">Capa (imagem do dispositivo)</Label>
                        {preview ? (
                            <div className="mb-2 flex items-center gap-3">
                                <img src={preview} alt="Prévia da capa" className="h-24 w-16 rounded-lg object-cover" />
                                <Button type="button" variant="ghost" size="sm" onClick={clearFile}>Remover</Button>
                            </div>
                        ) : resolveCoverUrl(item) && (
                            <div className="mb-2 flex items-center gap-3">
                                <img src={resolveCoverUrl(item)} alt="Capa atual" className="h-24 w-16 rounded-lg object-cover" />
                                <p className="text-xs text-muted-foreground">Capa atual — envie um novo arquivo para substituir.</p>
                            </div>
                        )}
                        <input
                            id="edit-cover"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handleFileChange}
                            className="w-full cursor-pointer rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-purple-500/20 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-purple-200"
                        />
                    </div>
                    <div>
                        <Label htmlFor="edit-description">Descrição</Label>
                        <Textarea
                            id="edit-description"
                            placeholder="Uma breve sinopse..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    {isFilm && (
                        <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Dados exclusivos do filme
                            </p>
                            <div>
                                <Label htmlFor="edit-release">Data de lançamento</Label>
                                <Input id="edit-release" type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
                            </div>
                            <Checkbox
                                label="Já assisti a este filme"
                                checked={isWatched}
                                onChange={(e) => setIsWatched(e.target.checked)}
                            />
                            {isWatched && (
                                <div>
                                    <Label htmlFor="edit-watched">Quando assistiu?</Label>
                                    <Input id="edit-watched" type="date" required value={watchedAt} onChange={(e) => setWatchedAt(e.target.value)} />
                                </div>
                            )}
                        </div>
                    )}
                    {formError && (
                        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                            {formError}
                        </p>
                    )}
                </Card>
            </form>

            {!isFilm && (
                <div>
                    <h2 className="mb-3 text-lg font-bold text-foreground">Temporadas e episódios</h2>
                    <SeasonsSection media={item} onChanged={onChanged} editable />
                </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
                <Button type="button" variant="ghost" onClick={handleDelete} disabled={deleting || saving}>
                    <IconTrash className="h-4 w-4 text-red-300" /> {deleting ? 'Excluindo...' : 'Excluir item'}
                </Button>
                <div className="flex gap-3">
                    <Button type="button" variant="ghost" onClick={onCancel} disabled={saving || deleting}>
                        Cancelar
                    </Button>
                    <Button type="submit" form="edit-media-form" disabled={saving || deleting}>
                        {saving ? 'Salvando...' : 'Salvar'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function BackButton({ onBack }) {
    return (
        <button type="button" onClick={onBack} aria-label="Voltar" className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-muted-foreground transition-colors hover:border-purple-500/40 hover:text-foreground">
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