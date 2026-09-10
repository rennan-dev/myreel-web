import { useState } from 'react';
import api from '../../api/axios';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/button';

const INITIAL_FORM = {
    type: 'filme', name: '', rating: '', image: '', description: '',
    release_date: '', is_watched: false, watched_at: ''
};

export default function CreateMediaModal({ open, onClose, onSuccess }) {
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    //redefine o formulário sempre que o modal fechar, garantindo um form limpo na próxima abertura
    const handleClose = () => {
        setFormData(INITIAL_FORM);
        setSubmitError('');
        setSubmitting(false);
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError('');
        try {
            await api.post('/media', formData);
            onSuccess(); //recarrega a lista no Dashboard
            handleClose(); //fecha o modal
        } catch (error) {
            setSubmitError(error.response?.data?.message || 'Erro ao criar: verifique os campos.');
            setSubmitting(false);
        }
    };

    const set = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title="Adicionar à lista"
            description="Cadastre um novo filme, série ou anime."
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <Label htmlFor="type">Tipo</Label>
                        <Select id="type" value={formData.type} onChange={(e) => set('type', e.target.value)}>
                            <option value="filme">Filme</option>
                            <option value="serie">Série</option>
                            <option value="anime">Anime</option>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="rating">Nota (1 a 5)</Label>
                        <Input
                            id="rating"
                            type="number"
                            step="0.1"
                            min="1"
                            max="5"
                            placeholder="Ex.: 4.5"
                            value={formData.rating}
                            onChange={(e) => set('rating', e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="Nome do título"
                        required
                        value={formData.name}
                        onChange={(e) => set('name', e.target.value)}
                    />
                </div>

                <div>
                    <Label htmlFor="image">Capa (URL da imagem)</Label>
                    <Input
                        id="image"
                        type="url"
                        placeholder="https://..."
                        value={formData.image}
                        onChange={(e) => set('image', e.target.value)}
                    />
                </div>

                <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                        id="description"
                        placeholder="Uma breve sinopse..."
                        value={formData.description}
                        onChange={(e) => set('description', e.target.value)}
                    />
                </div>

                {formData.type === 'filme' && (
                    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Dados exclusivos do filme
                        </p>
                        <div>
                            <Label htmlFor="release_date">Data de lançamento</Label>
                            <Input
                                id="release_date"
                                type="date"
                                required
                                value={formData.release_date}
                                onChange={(e) => set('release_date', e.target.value)}
                            />
                        </div>
                        <Checkbox
                            label="Já assisti a este filme"
                            checked={formData.is_watched}
                            onChange={(e) => set('is_watched', e.target.checked)}
                        />
                        {formData.is_watched && (
                            <div>
                                <Label htmlFor="watched_at">Quando assistiu?</Label>
                                <Input
                                    id="watched_at"
                                    type="date"
                                    required
                                    value={formData.watched_at}
                                    onChange={(e) => set('watched_at', e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                )}

                {submitError && (
                    <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                        {submitError}
                    </p>
                )}

                <div className="mt-2 flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={submitting}>
                        {submitting ? 'Salvando...' : 'Salvar'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}