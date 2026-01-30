import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

export function LoginPage() {
    const { login, loggedIn } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        if (loggedIn) {
            navigate('/');
        }
    }, [loggedIn, navigate]);

    const handlePrefill = () => {
        setFormData({
            email: 'josh@josh.com',
            password: '1111'
        });
    }

    const onFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        const result = await login(formData); 
        
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-card">
                <button 
                    type="button" 
                    onClick={handlePrefill}
                    className="magic-prefill-btn"
                    title="Auto-fill login"
                >
                    <Sparkles size={16} />
                </button>
                
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    {error && <div className="login-error">{error}</div>}
                    
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={onFormChange}
                        required
                    />
                    
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={onFormChange}
                        required
                    />
                    
                    <button type="submit">Login</button>
                    
                    <p>Don't have an account? <Link to="/signup">Signup</Link></p>
                </form>
            </div>
        </div>
    );
}