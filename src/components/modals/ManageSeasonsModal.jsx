import { useState } from 'react';
import api from '../../api/axios';

export default function ManageSeasonsModal({ media, onClose, onSuccess }) {
    const [seasonNumber, setSeasonNumber] = useState('');
    const [episodeNumbers, setEpisodeNumbers] = useState({});

    const handleAddSeason = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/media/${media.id}/seasons`, { season_number: seasonNumber });
            setSeasonNumber('');
            onSuccess(); //atualiza a lista para buscar a nova temporada
        } catch (error) {
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
        } catch (error) {
            alert('Erro ao criar episódio');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="mb-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Gerenciar: {media.name}</h2>
                    <button onClick={onClose} className="text-red-500 font-bold hover:text-red-700">X</button>
                </div>

                {/* Form Adicionar Temporada */}
                <form onSubmit={handleAddSeason} className="mb-6 flex gap-2 rounded bg-gray-100 p-3">
                    <input type="number" placeholder="Nº da Temporada" required min="1"
                           className="flex-1 rounded border p-2"
                           value={seasonNumber} onChange={e => setSeasonNumber(e.target.value)} />
                    <button type="submit" className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                        + Temporada
                    </button>
                </form>

                {/* Lista de Temporadas e Episódios */}
                <div className="flex flex-col gap-4">
                    {media.seasons?.map(season => (
                        <div key={season.id} className="rounded border p-4 shadow-sm">
                            <h3 className="mb-2 font-bold text-lg">Temporada {season.season_number}</h3>
                            
                            <div className="mb-3 flex flex-wrap gap-2">
                                {season.episodes?.map(ep => (
                                    <span key={ep.id} className={`rounded px-2 py-1 text-sm text-white ${ep.is_watched ? 'bg-blue-500' : 'bg-gray-500'}`}>
                                        Ep {ep.episode_number}
                                    </span>
                                ))}
                                {(!season.episodes || season.episodes.length === 0) && <span className="text-sm text-gray-500">Nenhum episódio adicionado.</span>}
                            </div>

                            {/* Form Adicionar Episódio */}
                            <form onSubmit={(e) => handleAddEpisode(season.id, e)} className="flex gap-2">
                                <input type="number" placeholder="Nº do Ep" required min="1"
                                       className="w-24 rounded border p-1 text-sm"
                                       value={episodeNumbers[season.id] || ''} 
                                       onChange={e => setEpisodeNumbers({...episodeNumbers, [season.id]: e.target.value})} />
                                <button type="submit" className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
                                    + Episódio
                                </button>
                            </form>
                        </div>
                    ))}
                    {(!media.seasons || media.seasons.length === 0) && <p className="text-gray-500">Nenhuma temporada cadastrada.</p>}
                </div>
            </div>
        </div>
    );
}