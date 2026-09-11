import { useState } from 'react';
import api from '../../api/axios';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { IconPlus, IconCheck, IconPlay, IconCalendar, IconTrash } from '../ui/icons';

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
export function SeasonsSection({ media, onChanged, editable = false }) {
    const [seasonCount, setSeasonCount] = useState('');
    const [episodeCounts, setEpisodeCounts] = useState({});
    const [seasonDates, setSeasonDates] = useState({});
    const [busy, setBusy] = useState({});
    const [formError, setFormError] = useState('');

    const seasons = [...(media?.seasons ?? [])].sort(
        (a, b) => Number(a.season_number) - Number(b.season_number)
    );
    const watchedCount = seasons.reduce(
        (acc, s) => acc + (s.episodes?.filter((ep) => ep.is_watched).length || 0),
        0
    );
    const totalEpisodes = seasons.reduce((acc, s) => acc + (s.episodes?.length || 0), 0);

    const setBusyKey = (key, value) => setBusy((prev) => ({ ...prev, [key]: value }));

    const handleBulkSeasons = async (e) => {
        e.preventDefault();
        setFormError('');
        const total = Number.parseInt(seasonCount, 10);
        if (!Number.isInteger(total) || total < 1 || total > 100) {
            setFormError('Informe um número de temporadas entre 1 e 100.');
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
        } catch {
            setFormError('Erro ao criar temporadas.');
        } finally {
            setBusyKey('bulk', false);
        }
    };

    const handleBulkEpisodes = async (seasonId, e) => {
        e.preventDefault();
        if (!editable) return;
        setFormError('');
        const total = Number.parseInt(episodeCounts[seasonId], 10);
        if (!Number.isInteger(total) || total < 1 || total > 500) {
            setFormError('Informe um número de episódios entre 1 e 500.');
            return;
        }
        const season = seasons.find((s) => s.id === seasonId);
        const existing = new Set((season?.episodes ?? []).map((ep) => Number(ep.episode_number)));
        setBusyKey(`eps-${seasonId}`, true);
        try {
            for (let n = 1; n <= total; n += 1) {
                if (existing.has(n)) continue;
                await api.post(`/seasons/${seasonId}/episodes`, { episode_number: n, is_watched: false });
            }
            setEpisodeCounts((prev) => ({ ...prev, [seasonId]: '' }));
            await onChanged?.();
        } catch {
            setFormError('Erro ao criar episódios.');
        } finally {
            setBusyKey(`eps-${seasonId}`, false);
        }
    };

    const handleSeasonDate = async (season) => {
        if (!editable) return;
        setFormError('');
        const draft = seasonDates[season.id];
        const current = season.release_date ? String(season.release_date).slice(0, 10) : '';
        const value = draft ?? current;
        setBusyKey(`date-${season.id}`, true);
        try {
            await api.patch(`/seasons/${season.id}`, { release_date: value === '' ? null : value });
            await onChanged?.();
        } catch {
            setFormError('Erro ao salvar data da temporada.');
        } finally {
            setBusyKey(`date-${season.id}`, false);
        }
    };

    const handleToggleEpisode = async (episode) => {
        if (!editable) return;
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

    return (
        <div>
            {editable && (
            <form onSubmit={handleBulkSeasons} className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                    <Label htmlFor="season-count">Número de temporadas</Label>
                    <Input id="season-count" type="number" min="1" max="100" step="1" placeholder="Ex.: 3" required value={seasonCount} onChange={(e) => setSeasonCount(e.target.value)} />
                    <p className="mt-1 text-xs text-muted-foreground">As temporadas 1 até N aparecem automaticamente.</p>
                </div>
                <Button type="submit" disabled={Boolean(busy.bulk)}>
                    <IconPlus className="h-4 w-4" /> {busy.bulk ? 'Criando...' : 'Gerar temporadas'}
                </Button>
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
                        episodeCountValue={episodeCounts[season.id] ?? ''}
                        onDateChange={(v) => setSeasonDates((prev) => ({ ...prev, [season.id]: v }))}
                        onSaveDate={() => handleSeasonDate(season)}
                        onToggleEpisode={handleToggleEpisode}
                        onDeleteSeason={() => handleDeleteSeason(season)}
                        onEpisodeCountChange={(v) => setEpisodeCounts((prev) => ({ ...prev, [season.id]: v }))}
                        onBulkEpisodes={(e) => handleBulkEpisodes(season.id, e)}
                    />
                ))}
                {seasons.length === 0 && (
                    <p className="rounded-xl border border-dashed border-white/12 bg-white/[0.02] px-4 py-8 text-center text-sm text-muted-foreground">{editable ? 'Nenhuma temporada cadastrada ainda. Informe o número acima para gerar.' : 'Nenhuma temporada cadastrada ainda.'}</p>
                )}
            </div>
        </div>
    );
}

function SeasonCard({ season, busy, editable, episodeCountValue, onDateChange, onSaveDate, onToggleEpisode, onEpisodeCountChange, onBulkEpisodes, onDeleteSeason }) {
    const sortedEps = [...(season.episodes ?? [])].sort((a, b) => Number(a.episode_number) - Number(b.episode_number));
    return (
        <Card className="p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="font-semibold text-foreground">Temporada {season.season_number}</h3>
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
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end">
                    <div className="flex-1">
                        <Label htmlFor={`season-date-${season.id}`}>Data de lançamento</Label>
                        <Input id={`season-date-${season.id}`} type="date" defaultValue={season.release_date ? String(season.release_date).slice(0, 10) : ''} onChange={(e) => onDateChange(e.target.value)} />
                        {season.release_date && (
                            <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground"><IconCalendar className="h-3 w-3" /> {formatDate(season.release_date)}</p>
                        )}
                    </div>
                    <Button type="button" variant="secondary" size="sm" disabled={Boolean(busy[`date-${season.id}`])} onClick={onSaveDate}>
                        {busy[`date-${season.id}`] ? 'Salvando...' : 'Salvar data'}
                    </Button>
                </div>
            ) : (
                season.release_date && (
                    <p className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <IconCalendar className="h-3.5 w-3.5" /> Lançada em {formatDate(season.release_date)}
                    </p>
                )
            )}

            <div className="mb-4 flex flex-wrap gap-2">
                {sortedEps.map((ep) => (editable ? (
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

            {editable && (
                <form onSubmit={onBulkEpisodes} className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <div className="flex-1">
                        <Label htmlFor={`eps-count-${season.id}`}>Número de episódios</Label>
                        <Input id={`eps-count-${season.id}`} type="number" min="1" max="500" step="1" placeholder="Ex.: 10" required value={episodeCountValue} onChange={(e) => onEpisodeCountChange(e.target.value)} />
                        <p className="mt-1 text-xs text-muted-foreground">Os episódios 1 até N aparecem automaticamente.</p>
                    </div>
                    <Button type="submit" variant="secondary" size="sm" disabled={Boolean(busy[`eps-${season.id}`])}>
                        <IconPlus className="h-3.5 w-3.5" /> {busy[`eps-${season.id}`] ? 'Gerando...' : 'Gerar episódios'}
                    </Button>
                </form>
            )}
        </Card>
    );
}