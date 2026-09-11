import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { SeasonsSection } from '../media/SeasonsSection';

export default function ManageSeasonsModal({ open, media, onClose, onSuccess }) {
    const [key, setKey] = useState(0);
    const handleClose = () => {
        setKey((k) => k + 1);
        onClose?.();
    };
    const mediaName = media?.name ?? '';
    return (
        <Modal open={open} onClose={handleClose} size="lg" title={mediaName ? `Gerenciar: ${mediaName}` : ''} description="Defina temporadas, episódios, datas e marque o que já assistiu.">
            {media && <SeasonsSection key={key} media={media} onChanged={onSuccess} />}
        </Modal>
    );
}