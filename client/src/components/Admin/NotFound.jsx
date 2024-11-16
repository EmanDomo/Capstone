// NotFoundPage.js
import React from 'react';
import { Link } from 'react-router-dom'; 
import "../../styles/NotFound.css";

const NotFoundPage = () => {
    return (
        <div className="not-found-page">
            <h2>404 Not Found</h2>
            <p>Oops! The page you're looking for doesn't exist.</p>
            <Link to="/" className="back-button">Go Back to Home</Link>
        </div>
    );
};

export default NotFoundPage;
