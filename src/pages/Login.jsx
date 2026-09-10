import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/login', { email, password });
            login(response.data.user, response.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao realizar login.');
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="w-96 rounded-lg bg-white p-8 shadow-md">
                <h2 className="mb-6 text-center text-2xl font-bold">MyReel Login</h2>
                {error && <div className="mb-4 rounded bg-red-100 p-2 text-sm text-red-600">{error}</div>}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mb-4 w-full rounded border p-2 focus:border-blue-500 focus:outline-none"
                    required
                />
                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mb-6 w-full rounded border p-2 focus:border-blue-500 focus:outline-none"
                    required
                />
                
                <button type="submit" className="mb-4 w-full rounded bg-blue-600 py-2 text-white transition hover:bg-blue-700">
                    Entrar
                </button>

                <div className="text-center text-sm">
                    <span className="text-gray-600">Não tem uma conta? </span>
                    <Link to="/register" className="text-blue-600 hover:underline">
                        Cadastre-se
                    </Link>
                </div>
            </form>
        </div>
    );
}