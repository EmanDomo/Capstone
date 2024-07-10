import React from 'react';
import { useLocation } from 'react-router-dom';

const Checkout = () => {
  const location = useLocation();
  const { cartItems } = location.state || { cartItems: [] };

  return (
    <div>
      <h1>Checkout Page</h1>
      <ul>
        {cartItems.map((item, index) => (
          <li key={index}>
            {item.itemname} - {item.quantity} x ₱{item.price}
          </li>
        ))}
      </ul>
      <form action="/pay" method="post">
        <input type="submit" value="Buy" />
      </form>
    </div>
  );
};

export default Checkout;
