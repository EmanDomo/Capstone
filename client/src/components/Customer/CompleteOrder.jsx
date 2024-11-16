
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap'; // Import Spinner from React Bootstrap
import '../../styles/CompleteOrder.css'; // Create a new CSS file for custom styles if you need
import { host } from '../../apiRoutes';

const CompleteOrder = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true); // State to track loading status

    useEffect(() => {
        const capturePayment = async () => {
            const queryParams = new URLSearchParams(location.search);
            const orderId = queryParams.get('token'); // PayPal sends the `token` as the order ID
            const payerId = queryParams.get('PayerID'); // Capture PayerID as well

            console.log("Attempting to capture payment for Order ID:", orderId, "PayerID:", payerId); // Debug

            if (orderId && payerId) {
                try {
                    const response = await fetch(`${host}/capture-payment`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ orderId }),
                    });

                    if (response.ok) {
                        console.log("Payment captured successfully"); // Debug
                        // Redirect to the success page
                        navigate('/success');
                    } else {
                        const errorData = await response.json();
                        console.error('Error capturing payment:', errorData); // Debug
                        alert('There was an issue with processing your payment. Please try again.');
                    }
                } catch (error) {
                    console.error('Capture payment error:', error);
                    alert('An error occurred while processing your payment. Please try again.');
                }
            } else {
                console.log("Order ID or Payer ID not found in URL query parameters"); // Debug
                alert('Invalid order or missing PayPal data. Please try again.');
            }
            setLoading(false); // Stop loading once the process is done
        };

        capturePayment();
    }, [location, navigate]);

    return (
        <div className="complete-order-container">
            {loading ? (
                <Spinner animation="border" variant="primary" className="loading-spinner" />
            ) : (
                <div>Processing your order...</div>
            )}
        </div>
    );
};

export default CompleteOrder;
