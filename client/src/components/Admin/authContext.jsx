import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [role, setRole] = useState(null);

    const checkAuth = () => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('role');
        
        if (!token || !userRole) {
            return false; 
        }

        return true; 
    };

    useEffect(() => {
        if (checkAuth()) {
            setIsAuthenticated(true);
            setRole(localStorage.getItem('role')); 
        } else {
            setIsAuthenticated(false);
            setRole(null);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, role }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
