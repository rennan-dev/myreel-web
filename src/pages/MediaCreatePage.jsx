import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { IconArrowLeft } from '../components/ui/icons';
import { CreateMediaForm } from '../components/media/CreateMediaForm';

export default function MediaCreatePage() {
    const navigate = useNavigate();
    const goBack = () => navigate(-1);
    return (
        <div className="mx-auto w-full max-w-3xl px-4 pt-6 pb-12 sm:px-6">
            <button type="button" onClick={goBack} aria-label="Voltar" className="mb-4 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-muted-foreground transition-colors hover:border-purple-500/40 hover:text-foreground">
                <IconArrowLeft className="h-5 w-5" />
            </button>
            <Card className="p-5 sm:p-8">
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-purple-300/90">Novo item</p>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Adicionar à lista</h1>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Cadastre um novo filme, série, anime ou jogo e marque seu status.</p>
                <div className="mt-6">
                    <CreateMediaForm onCancel={goBack} />
                </div>
            </Card>
        </div>
    );
}
