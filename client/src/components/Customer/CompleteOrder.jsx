import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const CompleteOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');
  const payerID = searchParams.get('PayerID');

  // Handler to navigate back to the menu
  const goToMenu = () => {
    navigate('/menu');
  };

  return (
    <div>
      <h1>Order Completion</h1>
      <p>Your order has been successfully completed!</p>
      <p>Token: {token}</p>
      <p>Payer ID: {payerID}</p>
      <button onClick={goToMenu}>Back to Menu</button>
    </div>
  );
};

export default CompleteOrder;
