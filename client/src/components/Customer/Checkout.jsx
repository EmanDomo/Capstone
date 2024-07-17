import React from 'react';
import { useLocation } from 'react-router-dom';
import '../../styles/Checkout.css';

const Checkout = () => {
  const location = useLocation();
  const { cartItems, grandTotal } = location.state || { cartItems: [], grandTotal: 0 };

  const overallTotal = cartItems.reduce((total, item) => total + item.quantity * item.price, 0);

  const handlePayGcash = async () => {
    try {
      const response = await fetch('/pay-gcash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ totalAmount: overallTotal }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Failed to get payment link');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="containerCheckout">
      <h1 className="titleCheckout">Checkout Page</h1>
      <ul className="itemsCheckout">
        {cartItems.map((item, index) => (
          <li key={index}>
            <span>{item.itemname}</span>
            <span>{item.quantity} x ₱{item.price}</span>
            <span>₱{item.quantity * item.price}</span>
          </li>
        ))}
      </ul>
      <h2>Total: ₱{overallTotal}</h2>
      <div className="payment-buttons">
        <form action="/pay" method="post" className="checkout-form">
          <input type="hidden" name="totalAmount" value={overallTotal} />
          <button type="submit" className="paypal-button">Pay with PayPal</button>
        </form>

        <button onClick={handlePayGcash} className="gcash-button">Pay GCash via Paymongo</button>
      </div>
    </div>
  );
};

export default Checkout;
