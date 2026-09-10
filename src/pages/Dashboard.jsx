import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import CreateMediaModal from '../components/modals/CreateMediaModal';
import ManageSeasonsModal from '../components/modals/ManageSeasonsModal';
import { MetalButton } from '../components/ui/MetalButton';

export default function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const [mediaList, setMediaList] = useState([]);
    
    //controle dos Modais
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [managingMedia, setManagingMedia] = useState(null); //armazena a mídia sendo gerenciada no momento

    const fetchMedia = () => {
        api.get('/media')
            .then(response => setMediaList(response.data))
            .catch(error => console.error(error));
    };

    useEffect(() => {
        fetchMedia();
    }, []);

    //atualiza a mídia que está aberta no modal de gerenciamento quando os dados recarregam
    useEffect(() => {
        if(managingMedia) {
            const updated = mediaList.find(m => m.id === managingMedia.id);
            if(updated) setManagingMedia(updated);
        }
    }, [mediaList]);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-5xl">
                <header className="mb-8 flex items-center justify-between rounded-lg bg-white p-4 shadow">
                    <h1 className="text-xl font-bold">Olá, {user?.username}</h1>
                    <div className="flex gap-4">
                        <MetalButton onClick={() => setIsCreateModalOpen(true)}>
                            + Adicionar Item
                        </MetalButton>
                        <button onClick={logout} className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600">
                            Sair
                        </button>
                    </div>
                </header>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {mediaList.map((item) => (
                        <div key={item.id} className="flex flex-col rounded-lg bg-white p-4 shadow border border-gray-100">
                            <span className="mb-2 w-max rounded bg-indigo-100 px-2 py-1 text-xs font-bold uppercase text-indigo-800">
                                {item.type}
                            </span>
                            <h2 className="text-lg font-bold truncate" title={item.name}>{item.name}</h2>
                            <p className="text-sm text-gray-600 mb-4 flex-1">Nota: {item.rating ? `${item.rating}/5.0` : 'Sem nota'}</p>
                            
                            {/* Botão condicional: Se for filme, diz que é filme único. Se for Série/Anime, abre modal */}
                            {item.type === 'filme' ? (
                                <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded text-center border">
                                    {item.is_watched ? `Assistido em: ${item.watched_at}` : 'Ainda não assistido'}
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setManagingMedia(item)}
                                    className="rounded bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                                >
                                    Gerenciar Temporadas ({item.seasons?.length || 0})
                                </button>
                            )}
                        </div>
                    ))}
                    
                    {mediaList.length === 0 && (
                        <p className="col-span-full text-center text-gray-500 mt-10">Sua lista está vazia. Adicione um novo item!</p>
                    )}
                </div>
            </div>

            {/* Renderização dos Modais */}
            {isCreateModalOpen && (
                <CreateMediaModal 
                    onClose={() => setIsCreateModalOpen(false)} 
                    onSuccess={fetchMedia} 
                />
            )}

            {managingMedia && (
                <ManageSeasonsModal 
                    media={managingMedia} 
                    onClose={() => setManagingMedia(null)} 
                    onSuccess={fetchMedia} 
                />
            )}
        </div>
    );
}