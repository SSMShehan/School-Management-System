import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing auth on mount
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const data = await authApi.login(username, password);
        const accessToken = data.access_token;

        // Decode JWT to get user info (basic decode, not verification)
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const userInfo = {
            username: payload.sub,
            role: payload.role,
            branchId: payload.branch_id,
        };

        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(userInfo));

        setToken(accessToken);
        setUser(userInfo);

        return userInfo;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const isAdmin = user?.role === 'admin';
    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            isAuthenticated,
            isAdmin,
            login,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
