import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { AuthProvider } from './context/AuthProvider';
import { Background } from './components/Background';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingState } from './components/ui/LoadingState';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MediaCreatePage = lazy(() => import('./pages/MediaCreatePage'));
const MediaDetailsPage = lazy(() => import('./pages/MediaDetailsPage'));

function App() {
    return (
        <MotionConfig reducedMotion="user">
            <AuthProvider>
                <Background />
                <BrowserRouter>
                    <Suspense
                        fallback={
                            <div className="flex min-h-screen items-center justify-center">
                                <LoadingState label="Carregando..." />
                            </div>
                        }
                    >
                        <Routes>
                            {/* Rotas Públicas */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Rotas Protegidas */}
                            <Route path="/" element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            } />
                            <Route path="/novo" element={
                                <ProtectedRoute>
                                    <MediaCreatePage />
                                </ProtectedRoute>
                            } />
                            <Route path="/media/:id" element={
                                <ProtectedRoute>
                                    <MediaDetailsPage />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </Suspense>
                </BrowserRouter>
            </AuthProvider>
        </MotionConfig>
    );
}

export default App;