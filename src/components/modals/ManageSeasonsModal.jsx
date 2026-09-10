import { useState } from 'react';
import api from '../../api/axios';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/button';
import { Badge } from '../ui/Badge';
import { IconPlus, IconCheck, IconPlay } from '../ui/icons';

export default function ManageSeasonsModal({ open, media, onClose, onSuccess }) {
    const [seasonNumber, setSeasonNumber] = useState('');
    const [episodeNumbers, setEpisodeNumbers] = useState({});

    const handleClose = () => onClose?.();

    const seasons = media?.seasons ?? [];
    const mediaName = media?.name ?? '';

    const watchedCount = seasons.reduce(
        (acc, s) => acc + (s.episodes?.filter((ep) => ep.is_watched).length || 0),
        0
    );

    const handleAddSeason = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/media/${media.id}/seasons`, { season_number: seasonNumber });
            setSeasonNumber('');
            onSuccess(); //atualiza a lista para buscar a nova temporada
        } catch {
            alert('Erro ao criar temporada');
        }
    };

    const handleAddEpisode = async (seasonId, e) => {
        e.preventDefault();
        try {
            await api.post(`/seasons/${seasonId}/episodes`, {
                episode_number: episodeNumbers[seasonId] || 1,
                is_watched: false
            });
            setEpisodeNumbers({ ...episodeNumbers, [seasonId]: '' });
            onSuccess();
        } catch {
            alert('Erro ao criar episódio');
        }
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            size="lg"
            title={mediaName ? `Gerenciar: ${mediaName}` : ''}
            description="Adicione e organize temporadas e episódios."
        >
            {/* Form Adicionar Temporada */}
            <form onSubmit={handleAddSeason} className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                    <label htmlFor="season-number" className="mb-1.5 block text-sm font-medium text-foreground">
                        Nova temporada
                    </label>
                    <Input
                        id="season-number"
                        type="number"
                        min="1"
                        placeholder="Nº da temporada"
                        required
                        value={seasonNumber}
                        onChange={(e) => setSeasonNumber(e.target.value)}
                    />
                </div>
                <Button type="submit">
                    <IconPlus className="h-4 w-4" /> Temporada
                </Button>
            </form>

            {seasons.length > 0 && (
                <p className="mb-4 text-xs text-muted-foreground">
                    {seasons.length} {seasons.length === 1 ? 'temporada' : 'temporadas'} · {watchedCount} {watchedCount === 1 ? 'episódio assistido' : 'episódios assistidos'}
                </p>
            )}

            {/* Lista de Temporadas e Episódios */}
            <div className="flex flex-col gap-4">
                {seasons.map((season) => (
                    <div key={season.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors duration-200 hover:border-purple-500/25">
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <h3 className="font-semibold text-foreground">Temporada {season.season_number}</h3>
                            <Badge variant="neutral">{season.episodes?.length || 0} epis</Badge>
                        </div>

                        <div className="mb-4 flex flex-wrap gap-2">
                            {season.episodes?.map((ep) =>
                                ep.is_watched ? (
                                    <span key={ep.id} className="inline-flex items-center gap-1.5 rounded-full border border-purple-400/40 bg-purple-500/15 px-3 py-1 text-xs font-medium text-purple-200 shadow-glow">
                                        <IconCheck className="h-3 w-3" /> Ep {ep.episode_number}
                                    </span>
                                ) : (
                                    <span key={ep.id} className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-xs font-medium text-muted-foreground">
                                        <IconPlay className="h-3 w-3" /> Ep {ep.episode_number}
                                    </span>
                                )
                            )}
                            {(!season.episodes || season.episodes.length === 0) && (
                                <span className="text-sm text-muted-foreground">Nenhum episódio ainda.</span>
                            )}
                        </div>

                        {/* Form Adicionar Episódio */}
                        <form onSubmit={(e) => handleAddEpisode(season.id, e)} className="flex gap-2">
                            <Input
                                type="number"
                                min="1"
                                placeholder="Nº do ep"
                                required
                                className="w-28"
                                aria-label={`Número do episódio da temporada ${season.season_number}`}
                                value={episodeNumbers[season.id] || ''}
                                onChange={(e) => setEpisodeNumbers({ ...episodeNumbers, [season.id]: e.target.value })}
                            />
                            <Button type="submit" variant="secondary" size="sm">
                                <IconPlus className="h-3.5 w-3.5" /> Episódio
                            </Button>
                        </form>
                    </div>
                ))}

                {seasons.length === 0 && (
                    <p className="rounded-xl border border-dashed border-white/12 bg-white/[0.02] px-4 py-8 text-center text-sm text-muted-foreground">
                        Nenhuma temporada cadastrada ainda.
                    </p>
                )}
            </div>
        </Modal>
    );
}