import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const Unauthorized = () => {
    const history = useHistory();

    useEffect(() => {
        const timer = setTimeout(() => {
            history.push('/login'); // Redirect to login page after 3 seconds
        }, 3000);

        return () => clearTimeout(timer); // Cleanup the timer on unmount
    }, [history]);

    return (
        <div>
            <h1>403 - Forbidden</h1>
            <p>You do not have access to this page. Redirecting to login...</p>
        </div>
    );
};

export default Unauthorized;
