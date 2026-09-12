import { useState } from 'react';
import api from '../../api/axios';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { IconPlus, IconCheck, IconPlay, IconCalendar, IconTrash, IconPencil } from '../ui/icons';

function formatDate(value) {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString('pt-BR');
}

/**
 * Gerenciador de temporadas/episódios reutilizável:
 * usado na página de detalhes e no modal legado.
 */
export function SeasonsSection({ media, onChanged, editable = false, episodesClickable = false, hideEpisodes = false, onSeasonDraftsChange }) {
    const [seasonCount, setSeasonCount] = useState('');
    const [episodeCounts, setEpisodeCounts] = useState({});
    const [seasonDates, setSeasonDates] = useState({});
    const [busy, setBusy] = useState({});
    const [formError, setFormError] = useState('');
    const [renamingSeason, setRenamingSeason] = useState(null);
    const [renameValue, setRenameValue] = useState('');
    const [renaming, setRenaming] = useState(false);

    const seasons = [...(media?.seasons ?? [])].sort(
        (a, b) => Number(a.season_number) - Number(b.season_number)
    );
    const watchedCount = seasons.reduce(
        (acc, s) => acc + (s.episodes?.filter((ep) => ep.is_watched).length || 0),
        0
    );
    const totalEpisodes = seasons.reduce((acc, s) => acc + (s.episodes?.length || 0), 0);

    const setBusyKey = (key, value) => setBusy((prev) => ({ ...prev, [key]: value }));

    // As datas e a quantidade de episódios são apenas rascunhos aqui:
    // o formulário pai persiste tudo quando o usuário clica em "Salvar".
    const handleSeasonDateChange = (seasonId, value) => {
        const nextDates = { ...seasonDates, [seasonId]: value };
        setSeasonDates(nextDates);
        onSeasonDraftsChange?.({ releaseDates: nextDates, episodeCounts });
    };

    const handleEpisodeCountChange = (seasonId, value) => {
        const nextCounts = { ...episodeCounts, [seasonId]: value };
        setEpisodeCounts(nextCounts);
        onSeasonDraftsChange?.({ releaseDates: seasonDates, episodeCounts: nextCounts });
    };

    const handleBulkSeasons = async (e) => {
        e.preventDefault();
        setFormError('');
        const total = Number.parseInt(seasonCount, 10);
        if (!Number.isInteger(total) || total < 1 || total > 30) {
            setFormError('Informe um número de temporadas entre 1 e 30.');
            return;
        }
        const existing = new Set(seasons.map((s) => Number(s.season_number)));
        setBusyKey('bulk', true);
        try {
            for (let n = 1; n <= total; n += 1) {
                if (existing.has(n)) continue;
                await api.post(`/media/${media.id}/seasons`, { season_number: n });
            }
            setSeasonCount('');
            await onChanged?.();
        } catch (error) {
            // exibe o motivo retornado pela API (ex.: limite de 30 temporadas atingido)
            setFormError(error.response?.data?.message || 'Erro ao criar temporadas.');
        } finally {
            setBusyKey('bulk', false);
        }
    };

    const handleToggleEpisode = async (episode) => {
        if (!editable && !episodesClickable) return;
        setFormError('');
        const key = `ep-${episode.id}`;
        setBusyKey(key, true);
        try {
            await api.patch(`/episodes/${episode.id}`, { is_watched: !episode.is_watched });
            await onChanged?.();
        } catch {
            setFormError('Erro ao atualizar episódio.');
        } finally {
            setBusyKey(key, false);
        }
    };

    const handleDeleteSeason = async (season) => {
        if (!editable) return;
        const ok = window.confirm(`Excluir a Temporada ${season.season_number} e todos os episódios dela?`);
        if (!ok) return;
        setFormError('');
        setBusyKey(`del-season-${season.id}`, true);
        try {
            await api.delete(`/seasons/${season.id}`);
            await onChanged?.();
        } catch {
            setFormError('Erro ao excluir temporada.');
        } finally {
            setBusyKey(`del-season-${season.id}`, false);
        }
    };

    const openRenameModal = (season) => {
        setRenamingSeason(season);
        setRenameValue(season.title ?? '');
    };

    const handleRenameSeason = async (e) => {
        e.preventDefault();
        if (!renamingSeason) return;
        setFormError('');
        setRenaming(true);
        try {
            const title = renameValue.trim();
            await api.patch(`/seasons/${renamingSeason.id}`, { title: title === '' ? null : title });
            setRenamingSeason(null);
            await onChanged?.();
        } catch {
            setFormError('Erro ao renomear a temporada.');
        } finally {
            setRenaming(false);
        }
    };

    return (
        <div>
            {editable && (
            <form onSubmit={handleBulkSeasons} className="mb-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                        <Label htmlFor="season-count">Número de temporadas</Label>
                        <Input id="season-count" type="number" min="1" max="30" step="1" placeholder="Ex.: 3" required value={seasonCount} onChange={(e) => setSeasonCount(e.target.value)} />
                    </div>
                    <Button type="submit" disabled={Boolean(busy.bulk)}>
                        <IconPlus className="h-4 w-4" /> {busy.bulk ? 'Criando...' : 'Gerar temporadas'}
                    </Button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">As temporadas 1 até N aparecem automaticamente.</p>
            </form>
            )}
            {formError && (
                <p role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{formError}</p>
            )}
            {seasons.length > 0 && (
                <p className="mb-4 text-xs text-muted-foreground">{seasons.length} {seasons.length === 1 ? 'temporada' : 'temporadas'} · {watchedCount}/{totalEpisodes} episódios assistidos</p>
            )}
            <div className="flex flex-col gap-4">
                {seasons.map((season) => (
                    <SeasonCard
                        key={season.id}
                        season={season}
                        busy={busy}
                        editable={editable}
                        episodesClickable={episodesClickable}
                        hideEpisodes={hideEpisodes}
                        episodeCountValue={episodeCounts[season.id] ?? ''}
                        onDateChange={(v) => handleSeasonDateChange(season.id, v)}
                        onEpisodeCountChange={(v) => handleEpisodeCountChange(season.id, v)}
                        onToggleEpisode={handleToggleEpisode}
                        onDeleteSeason={() => handleDeleteSeason(season)}
                        onRenameSeason={() => openRenameModal(season)}
                    />
                ))}
                {seasons.length === 0 && (
                    <p className="rounded-xl border border-dashed border-white/12 bg-white/[0.02] px-4 py-8 text-center text-sm text-muted-foreground">{editable ? 'Nenhuma temporada cadastrada ainda. Informe o número acima para gerar.' : 'Nenhuma temporada cadastrada ainda.'}</p>
                )}
            </div>

            <Modal
                open={Boolean(renamingSeason)}
                onClose={() => { if (!renaming) setRenamingSeason(null); }}
                title="Renomear temporada"
                description={renamingSeason ? `Temporada ${renamingSeason.season_number}` : ''}
            >
                <form onSubmit={handleRenameSeason} className="flex flex-col gap-4">
                    <div>
                        <Label htmlFor="season-rename">Título da temporada</Label>
                        <Input
                            id="season-rename"
                            type="text"
                            maxLength={255}
                            placeholder={`Temporada ${renamingSeason?.season_number ?? ''}`}
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                        />
                        <p className="mt-1 text-xs text-muted-foreground">Deixe vazio para voltar a exibir "Temporada N".</p>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" disabled={renaming} onClick={() => setRenamingSeason(null)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={renaming}>
                            {renaming ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

function SeasonCard({ season, busy, editable, episodesClickable, hideEpisodes, episodeCountValue, onDateChange, onEpisodeCountChange, onToggleEpisode, onDeleteSeason, onRenameSeason }) {
    const canToggleEpisode = Boolean(editable || episodesClickable);
    const sortedEps = [...(season.episodes ?? [])].sort((a, b) => Number(a.episode_number) - Number(b.episode_number));
    return (
        <Card className="p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-1.5">
                    <h3 className="truncate font-semibold text-foreground">{season.title ? season.title : `Temporada ${season.season_number}`}</h3>
                    {editable && (
                        <button
                            type="button"
                            aria-label={`Renomear temporada ${season.season_number}`}
                            title="Renomear temporada"
                            onClick={onRenameSeason}
                            className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 text-muted-foreground transition-colors hover:border-purple-500/40 hover:text-foreground"
                        >
                            <IconPencil className="h-3 w-3" />
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="neutral">{season.episodes?.length || 0} epis</Badge>
                    {editable && (
                        <button
                            type="button"
                            aria-label={`Excluir Temporada ${season.season_number}`}
                            disabled={Boolean(busy[`del-${season.id}`])}
                            onClick={onDeleteSeason}
                            className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/10 text-muted-foreground transition-colors hover:border-red-500/40 hover:text-red-300 disabled:opacity-60"
                        >
                            <IconTrash className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {editable ? (
                <div className="mb-3">
                    <Label htmlFor={`season-date-${season.id}`}>Data de lançamento</Label>
                    <Input id={`season-date-${season.id}`} type="date" defaultValue={season.release_date ? String(season.release_date).slice(0, 10) : ''} onChange={(e) => onDateChange(e.target.value)} />
                    {season.release_date && (
                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground"><IconCalendar className="h-3 w-3" /> {formatDate(season.release_date)}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">A data é salva automaticamente ao clicar em "Salvar".</p>
                </div>
            ) : (
                season.release_date && (
                    <p className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <IconCalendar className="h-3.5 w-3.5" /> Lançada em {formatDate(season.release_date)}
                    </p>
                )
            )}

            {!hideEpisodes && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {sortedEps.map((ep) => (canToggleEpisode ? (
                        <button
                            key={ep.id}
                            type="button"
                            disabled={Boolean(busy[`ep-${ep.id}`])}
                            onClick={() => onToggleEpisode(ep)}
                            title={ep.is_watched ? 'Clique para desmarcar' : 'Clique para marcar como assistido'}
                            className={ep.is_watched
                                ? 'inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-purple-400/40 bg-purple-500/15 px-3 py-1 text-xs font-medium text-purple-200 shadow-glow transition-transform hover:scale-105 disabled:opacity-60'
                                : 'inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-xs font-medium text-muted-foreground transition-transform hover:scale-105 hover:border-purple-500/40 disabled:opacity-60'}
                        >
                            {ep.is_watched ? <IconCheck className="h-3 w-3" /> : <IconPlay className="h-3 w-3" />} Ep {ep.episode_number}
                        </button>
                    ) : (
                        <span
                            key={ep.id}
                            className={ep.is_watched
                                ? 'inline-flex items-center gap-1.5 rounded-full border border-purple-400/40 bg-purple-500/15 px-3 py-1 text-xs font-medium text-purple-200'
                                : 'inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-xs font-medium text-muted-foreground'}
                        >
                            {ep.is_watched ? <IconCheck className="h-3 w-3" /> : <IconPlay className="h-3 w-3" />} Ep {ep.episode_number}
                        </span>
                    )))}
                    {sortedEps.length === 0 && (<span className="text-sm text-muted-foreground">Nenhum episódio ainda.</span>)}
                </div>
            )}

            {editable && (
                <div>
                    <Label htmlFor={`eps-count-${season.id}`}>Número de episódios</Label>
                    <Input id={`eps-count-${season.id}`} type="number" min="1" max="50" step="1" placeholder="Ex.: 10" value={episodeCountValue} onChange={(e) => onEpisodeCountChange(e.target.value)} />
                    <p className="mt-1 text-xs text-muted-foreground">Os episódios 1 até N são gerados automaticamente ao clicar em "Salvar".</p>
                </div>
            )}
        </Card>
    );
}