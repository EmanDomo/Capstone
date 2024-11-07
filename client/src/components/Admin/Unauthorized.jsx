import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/userlogin'); // Redirect to login page after 3 seconds
        }, 3000);

        return () => clearTimeout(timer); // Cleanup the timer on unmount
    }, [navigate]);

    return (
        <div>
            <h1>403 - Forbidden</h1>
            <p>You do not have access to this page. Redirecting to login...</p>
        </div>
    );
};

export default Unauthorized;
