import { useState, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";

export function AuthProvider({ children }) {
    const [loading, setLoading] = useState(true);
    const API_URL = "http://localhost:";

    const value = {
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}