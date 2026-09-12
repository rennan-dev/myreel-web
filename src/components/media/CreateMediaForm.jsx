import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/button';
import { IconFilm, IconTv, IconSpark } from '../ui/icons';
import { CoverEditor } from './CoverEditor';
import { cn } from '../../lib/utils';

const INITIAL_FORM = { type: 'filme', name: '', rating: '', description: '', release_date: '', is_watched: false, watched_at: '' };
const TYPE_OPTIONS = [
    { value: 'filme', label: 'Filme', Icon: IconFilm },
    { value: 'serie', label: 'Série', Icon: IconTv },
    { value: 'anime', label: 'Anime', Icon: IconSpark },
];
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 4 * 1024 * 1024;

export function CreateMediaForm({ onCancel, onCreated }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState('');
    const [coverValue, setCoverValue] = useState({ x: 0, y: 0, scale: 1 });
    const [fileError, setFileError] = useState('');
    const fileInputRef = useRef(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const set = (f, v) => setFormData((p) => ({ ...p, [f]: v }));
    const resetFile = () => {
        setCoverFile(null);
        if (coverPreview) URL.revokeObjectURL(coverPreview);
        setCoverPreview('');
        setFileError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        setFileError('');
        if (!file) { resetFile(); return; }
        const ext = file.name?.split('.').pop()?.toLowerCase();
        const okExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
        if (!ACCEPTED.includes(file.type) && !okExt) {
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
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (fileError) return;
        setSubmitting(true);
        setSubmitError('');
        try {
            const isFilm = formData.type === 'filme';
            const payload = new FormData();
            payload.append('type', formData.type);
            payload.append('name', formData.name);
            if (formData.rating !== '') payload.append('rating', formData.rating);
            if (formData.description) payload.append('description', formData.description);
            if (isFilm) {
                if (formData.release_date) payload.append('release_date', formData.release_date);
                payload.append('is_watched', formData.is_watched ? '1' : '0');
                if (formData.is_watched && formData.watched_at) payload.append('watched_at', formData.watched_at);
            }
            if (coverFile) {
                payload.append('image', coverFile);
                payload.append('cover_x', String(coverValue.x));
                payload.append('cover_y', String(coverValue.y));
                payload.append('cover_scale', String(coverValue.scale));
            }
            const res = await api.post('/media', payload);
            const created = res?.data?.data;
            if (onCreated) onCreated(created);
            navigate(created?.id ? `/media/${created.id}` : '/');
        } catch (error) {
            const errs = error.response?.data?.errors;
            const msg = errs ? Object.values(errs).flat().join(' ') : error.response?.data?.message;
            setSubmitError(msg || 'Erro ao criar: verifique os campos.');
            setSubmitting(false);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <Label>Tipo</Label>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Tipo">
                    {TYPE_OPTIONS.map((opt) => (
                        <TypeButton key={opt.value} opt={opt} active={formData.type === opt.value} onSelect={() => set('type', opt.value)} />
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <Label htmlFor="cm-name">Nome</Label>
                    <Input id="cm-name" type="text" placeholder="Nome do título" required value={formData.name} onChange={(e) => set('name', e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="cm-rating">Nota (1 a 5)</Label>
                    <Input id="cm-rating" type="number" step="0.1" min="1" max="5" placeholder="Ex.: 4.5" value={formData.rating} onChange={(e) => set('rating', e.target.value)} />
                </div>
            </div>
            <div>
                <Label htmlFor="cm-cover">Capa (imagem do dispositivo)</Label>
                <Input id="cm-cover" ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileChange} />
                <p className="mt-1 text-xs text-muted-foreground">Apenas imagens (JPG, PNG, WEBP ou GIF) de até 4MB.</p>
                {fileError && (<p role="alert" className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{fileError}</p>)}
                {coverPreview && (
                    <div className="mt-3 flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:flex-row">
                        <CoverEditor src={coverPreview} value={coverValue} onChange={setCoverValue} />
                        <div className="flex flex-1 flex-col justify-between gap-3">
                            <div>
                                <p className="truncate text-sm font-medium text-foreground">{coverFile?.name}</p>
                                <p className="text-xs text-muted-foreground">{coverFile ? `${(coverFile.size / 1024 / 1024).toFixed(2)} MB` : ''}</p>
                            </div>
                            <Button type="button" variant="ghost" onClick={resetFile}>Remover</Button>
                        </div>
                    </div>
                )}
            </div>
            <div>
                <Label htmlFor="cm-desc">Descrição</Label>
                <Textarea id="cm-desc" placeholder="Uma breve sinopse..." className="h-36 resize-none overflow-y-auto" value={formData.description} onChange={(e) => set('description', e.target.value)} />
            </div>
            {formData.type === 'filme' && (
                <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dados exclusivos do filme</p>
                    <div>
                        <Label htmlFor="cm-release">Data de lançamento</Label>
                        <Input id="cm-release" type="date" required value={formData.release_date} onChange={(e) => set('release_date', e.target.value)} />
                    </div>
                    <Checkbox label="Já assisti a este filme" checked={formData.is_watched} onChange={(e) => set('is_watched', e.target.checked)} />
                    {formData.is_watched && (
                        <div>
                            <Label htmlFor="cm-watched">Quando assistiu?</Label>
                            <Input id="cm-watched" type="date" required value={formData.watched_at} onChange={(e) => set('watched_at', e.target.value)} />
                        </div>
                    )}
                </div>
            )}
            {(formData.type === 'serie' || formData.type === 'anime') && (
                <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-muted-foreground">Após salvar, você informa o número de temporadas e episódios na página do item.</p>
            )}
            {submitError && (
                <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{submitError}</p>
            )}
            <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar'}</Button>
            </div>
        </form>
    );
}

function TypeButton({ opt, active, onSelect }) {
    const OptIcon = opt.Icon;
    return (
        <button type="button" role="radio" aria-checked={active} onClick={onSelect}
            className={cn('flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-medium transition-all', active ? 'border-purple-500/60 bg-purple-500/15 text-foreground shadow-glow' : 'border-white/10 bg-white/[0.03] text-muted-foreground hover:border-purple-500/30 hover:text-foreground')}>
            <OptIcon className="h-5 w-5" />{opt.label}
        </button>
    );
}