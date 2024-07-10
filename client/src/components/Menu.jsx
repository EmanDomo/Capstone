import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Header from './Header';
import axios from 'axios';
import moment from 'moment';
import Card from 'react-bootstrap/Card';
import { jwtDecode } from 'jwt-decode';

const Menu = () => {
  const [data, setData] = useState([]);
  const [userName, setUserName] = useState('');
  const [cartItems, setCartItems] = useState([]); // Declare cartItems state

  const getUserData = async () => {
    try {
      const token = localStorage.getItem('token'); // Retrieve the token from local storage
      const res = await axios.get('/getdata', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
        },
      });

      if (res.data.status === 201) {
        console.log('Data fetched successfully');
        setData(res.data.data);
      } else {
        console.log('Error fetching data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getCartData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/cart', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.data.status === 'success') {
        setCartItems(res.data.data); // Set cart items fetched from the server
      } else {
        console.log('Error fetching cart data');
      }
    } catch (error) {
      console.error('Error fetching cart data:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserName(decodedToken.name);
    }
    getUserData();
    getCartData();
  }, []);

  const handleAddToCart = async (itemId) => {
    const quantity = 1; 
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        '/add-to-cart',
        {
          itemId,
          quantity,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (res.data.status === 'success') {
        console.log('Item added to cart successfully');
        getCartData(); // Refresh cart data after adding item
      } else {
        console.log('Error adding item to cart');
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

  return (
    <>
      <header>
        <Header />
      </header>
      <h3>Welcome Back, {userName}!</h3>
      <div className='card-container'>
        {data.length > 0 &&
          data.map((el, i) => (
            <Card key={i} style={{ width: '22rem', height: '25rem' }} className='mb-3'>
              <Card.Img
                variant='top'
                src={`/uploads/${el.img}`}
                style={{ width: '100px', textAlign: 'center', margin: 'auto' }}
                className='mt-2'
              />
              <Card.Body className='text-center'>
                <Card.Title>Name: {el.itemname}</Card.Title>
                <Card.Text>Date Added: {moment(el.date).format('DD-MM-YYYY')}</Card.Text>
                <Card.Text>Quantity: {el.quantity}</Card.Text>
                <Card.Text>Price: ₱{el.price}</Card.Text>
                <Button variant='success' className='col-lg-6 text-center' onClick={() => handleAddToCart(el.id)}>
                  Add
                </Button>
              </Card.Body>
            </Card>
          ))}
      </div>
    </>
  );
};

export default Menu;
