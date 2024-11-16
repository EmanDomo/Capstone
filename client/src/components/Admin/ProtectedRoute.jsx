import React from 'react';
import { Navigate } from 'react-router-dom'; 
import { useAuth } from './authContext'; 

const ProtectedRoute = ({ element, allowedRoles }) => {
    const { isAuthenticated, role } = useAuth();  

    if (isAuthenticated === null) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated || !allowedRoles.includes(role)) {
        return <Navigate to="/Unauthorized" replace />;
    }

    return element;
};

export default ProtectedRoute;
