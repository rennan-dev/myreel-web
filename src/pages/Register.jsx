import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/register', { 
                username, 
                email, 
                password 
            });
            
            login(response.data.user, response.data.token);
            navigate('/');
        } catch (err) {
            const apiError = err.response?.data?.message;
            const validationErrors = err.response?.data?.errors;
            
            if(validationErrors) {
                const firstError = Object.values(validationErrors)[0][0];
                setError(firstError);
            } else {
                setError(apiError || 'Erro ao realizar cadastro.');
            }
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="w-96 rounded-lg bg-white p-8 shadow-md">
                <h2 className="mb-6 text-center text-2xl font-bold">Criar Conta MyReel</h2>
                
                {error && <div className="mb-4 rounded bg-red-100 p-2 text-sm text-red-600">{error}</div>}
                
                <input
                    type="text"
                    placeholder="Nome de usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mb-4 w-full rounded border p-2 focus:border-blue-500 focus:outline-none"
                    required
                />
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
                
                <button type="submit" className="mb-4 w-full rounded bg-green-600 py-2 text-white transition hover:bg-green-700">
                    Cadastrar
                </button>

                <div className="text-center text-sm">
                    <span className="text-gray-600">Já tem uma conta? </span>
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Entre aqui
                    </Link>
                </div>
            </form>
        </div>
    );
}