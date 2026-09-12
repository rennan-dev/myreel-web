import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { MetalButton } from '../components/ui/MetalButton';
import { IconReel } from '../components/ui/icons';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const response = await api.post('/register', { username, email, password });
            login(response.data.user, response.data.token);
            navigate('/');
        }catch (err) {
            const apiError = err.response?.data?.message;
            const validationErrors = err.response?.data?.errors;
            if(validationErrors) {
                setError(Object.values(validationErrors)[0][0]);
            }else {
                setError(apiError || 'Erro ao realizar cadastro.');
            }
        }finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-md"
            >
                <div className="glass relative overflow-hidden rounded-2xl p-8 shadow-glow-lg">
                    <div
                        aria-hidden
                        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/70 to-transparent"
                    />

                    <div className="mb-8 flex flex-col items-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-500/30 bg-gradient-to-br from-violet-600/50 to-purple-900/50 shadow-glow">
                            <IconReel className="h-7 w-7 text-highlight" />
                        </div>
                        <h1 className="chrome-text mt-4 text-2xl font-extrabold tracking-tight">
                            Criar conta
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Comece a montar sua coleção em segundos
                        </p>
                    </div>

                    {error && (
                        <div
                            role="alert"
                            className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300"
                        >
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                        <div>
                            <Label htmlFor="username">Nome de usuário</Label>
                            <Input
                                id="username"
                                type="text"
                                autoComplete="username"
                                placeholder="seu_usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder="voce@exemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Mínimo de 8 caracteres"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <MetalButton
                            type="submit"
                            metalFxClassName="w-full"
                            className="w-full"
                            disabled={submitting}
                            aria-busy={submitting}
                        >
                            {submitting ? 'Criando conta...' : 'Cadastrar'}
                        </MetalButton>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">Já tem uma conta? </span>
                        <Link
                            to="/login"
                            className="font-medium text-purple-300 transition-colors hover:text-highlight"
                        >
                            Entre aqui
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}