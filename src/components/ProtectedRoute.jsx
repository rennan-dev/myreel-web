import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    if(loading) return <div className="p-4 text-center">Carregando segurança...</div>;

    if(!user) return <Navigate to="/login" replace />;

    return children;
};