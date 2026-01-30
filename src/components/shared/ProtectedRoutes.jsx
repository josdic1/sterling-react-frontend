import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function ProtectedRoutes({ children }) {
    const { loading, loggedIn } = useAuth();
    
    // Wait for session check to complete
    if (loading) {
        return <div>Loading...</div>;
    }
    
    if (!loggedIn) {
        return <Navigate to="/login" replace />;
    }
    
    return children;
}