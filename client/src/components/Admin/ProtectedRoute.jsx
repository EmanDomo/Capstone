// ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element: Component, roles, ...rest }) => {
    const user = JSON.parse(localStorage.getItem('token'));

    if (!user) {
        // If no user is found, redirect to login
        return <Navigate to="/userlogin" replace />;
    }

    // Check if the user's role is authorized to access this route
    if (roles && roles.length && !roles.includes(user.role)) {
        // If not authorized, redirect to unauthorized page
        return <Navigate to="/unauthorized" replace />;
    }

    // If authorized, render the requested component
    return <Component />;
};

export default ProtectedRoute;
