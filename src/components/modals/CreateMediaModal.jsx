import { useRef, useState } from 'react';
import api from '../../api/axios';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/button';

const INITIAL_FORM = {
    type: 'filme', name: '', rating: '', description: '',
    release_date: '', is_watched: false, watched_at: ''
};

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 4 * 1024 * 1024; // 4MB (igual ao max:4096 da API)

export default function CreateMediaModal({ open, onClose, onSuccess }) {
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState('');
    const [fileError, setFileError] = useState('');
    const fileInputRef = useRef(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    //redefine o formulário sempre que o modal fechar, garantindo um form limpo na próxima abertura
    const handleClose = () => {
        setFormData(INITIAL_FORM);
        setCoverFile(null);
        if (coverPreview) URL.revokeObjectURL(coverPreview);
        setCoverPreview('');
        setFileError('');
        setSubmitError('');
        setSubmitting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onClose();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        setFileError('');
        if (!file) {
            setCoverFile(null);
            if (coverPreview) URL.revokeObjectURL(coverPreview);
            setCoverPreview('');
            return;
        }
        // aceita apenas imagens (nada de outros arquivos)
        const ext = file.name?.split('.').pop()?.toLowerCase();
        const validByExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
        if (!ACCEPTED_TYPES.includes(file.type) && !validByExt) {
            setFileError('Selecione apenas imagens (JPG, PNG, WEBP ou GIF).');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }
        if (file.size > MAX_SIZE) {
            setFileError('A imagem deve ter no máximo 4MB.');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }
        if (coverPreview) URL.revokeObjectURL(coverPreview);
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    };

    const handleRemoveFile = () => {
        setCoverFile(null);
        if (coverPreview) URL.revokeObjectURL(coverPreview);
        setCoverPreview('');
        setFileError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const formatValidationErrors = (errors) => {
        if (!errors || typeof errors !== 'object') return '';
        return Object.values(errors).flat().join(' ');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (fileError) return;
        setSubmitting(true);
        setSubmitError('');
        try {
            // sempre multipart: capa é só upload do dispositivo (sem URL)
            // serie/anime não enviam datas da mídia: release vive na temporada, watched no episódio
            const isFilm = formData.type === 'filme';
            const payload = new FormData();
            payload.append('type', formData.type);
            payload.append('name', formData.name);
            if (formData.rating !== '') payload.append('rating', formData.rating);
            if (formData.description) payload.append('description', formData.description);
            if (isFilm) {
                if (formData.release_date) payload.append('release_date', formData.release_date);
                payload.append('is_watched', formData.is_watched ? '1' : '0');
                if (formData.is_watched && formData.watched_at) {
                    payload.append('watched_at', formData.watched_at);
                }
            }
            if (coverFile) payload.append('image', coverFile);
            await api.post('/media', payload);
            onSuccess(); //recarrega a lista no Dashboard
            handleClose(); //fecha o modal
        } catch (error) {
            const apiErrors = error.response?.data?.errors;
            setSubmitError(
                formatValidationErrors(apiErrors) ||
                error.response?.data?.message ||
                'Erro ao criar: verifique os campos.'
            );
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
                    <Label htmlFor="cover">Capa (imagem do dispositivo)</Label>
                    <Input
                        id="cover"
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleFileChange}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                        Apenas imagens (JPG, PNG, WEBP ou GIF) de até 4MB. Funciona no computador e no celular.
                    </p>
                    {fileError && (
                        <p role="alert" className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                            {fileError}
                        </p>
                    )}
                    {coverPreview && (
                        <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <img
                                src={coverPreview}
                                alt="Prévia da capa"
                                className="h-20 w-14 shrink-0 rounded-lg object-cover"
                            />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground">{coverFile?.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {coverFile ? `${(coverFile.size / 1024 / 1024).toFixed(2)} MB` : ''}
                                </p>
                            </div>
                            <Button type="button" variant="ghost" onClick={handleRemoveFile}>
                                Remover
                            </Button>
                        </div>
                    )}
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