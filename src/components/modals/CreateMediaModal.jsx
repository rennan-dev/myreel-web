import { useState } from 'react';
import api from '../../api/axios';

export default function CreateMediaModal({ onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        type: 'filme', name: '', rating: '', image: '', description: '',
        release_date: '', is_watched: false, watched_at: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/media', formData);
            onSuccess(); //recarrega a lista no Dashboard
            onClose();   //fecha o modal
        } catch (error) {
            alert('Erro ao criar: ' + (error.response?.data?.message || 'Verifique os campos.'));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                <h2 className="mb-4 text-xl font-bold">Adicionar à Lista</h2>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <select
                        className="rounded border p-2"
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value})}
                    >
                        <option value="filme">Filme</option>
                        <option value="serie">Série</option>
                        <option value="anime">Anime</option>
                    </select>

                    <input type="text" placeholder="Nome" required className="rounded border p-2" 
                           value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    
                    <input type="number" step="0.1" min="1" max="5" placeholder="Nota (1 a 5)" className="rounded border p-2"
                           value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} />

                    <textarea placeholder="Descrição" className="rounded border p-2"
                              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />

                    {formData.type === 'filme' && (
                        <div className="flex flex-col gap-3 rounded bg-gray-50 p-3 border">
                            <label className="text-sm font-semibold">Exclusivo de Filme:</label>
                            <input type="date" className="rounded border p-2" required
                                   value={formData.release_date} onChange={e => setFormData({...formData, release_date: e.target.value})} />
                            
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={formData.is_watched}
                                       onChange={e => setFormData({...formData, is_watched: e.target.checked})} />
                                Já assistido?
                            </label>

                            {formData.is_watched && (
                                <input type="date" className="rounded border p-2" required
                                       value={formData.watched_at} onChange={e => setFormData({...formData, watched_at: e.target.value})} />
                            )}
                        </div>
                    )}

                    <div className="mt-4 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400">Cancelar</button>
                        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}