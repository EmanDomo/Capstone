// ForbiddenPage.js
import React from 'react';
import '../../styles/Unauthorized.css'; 

const ForbiddenPage = () => {
    return (
        <div className="forbidden-page">
            <h2>403 Forbidden</h2>
            <p>You do not have permission to access this page.</p>
            <a href="/" className="back-button">Go Back to Home</a>
        </div>
    );
};

export default ForbiddenPage;
