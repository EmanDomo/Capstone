import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Header from './Header';
import axios from 'axios';
import moment from 'moment';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import { ListGroup } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../../styles/Menu.css';

const Menu = () => {
  const [data, setData] = useState([]);
  const [userName, setUserName] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [addedItemName, setAddedItemName] = useState('');
  const [showCart, setShowCart] = useState(false); // State for cart visibility
  const navigate = useNavigate(); // Define navigate using useNavigate
  

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserName(decodedToken.name);
    }
    getUserData();
    getCartData();
  }, []);

  const getUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/getdata', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
        setCartItems(res.data.data);
      } else {
        console.log('Error fetching cart data');
      }
    } catch (error) {
      console.error('Error fetching cart data:', error);
    }
  };

  const handleAddToCart = async (itemId, itemName) => {
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
        setAddedItemName(itemName);
        setShowModal(true);
        getCartData();
      } else {
        console.log('Error adding item to cart');
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

  const handleCloseModal = () => setShowModal(false);

  const handleCartShow = () => setShowCart(true);
  const handleCartClose = () => setShowCart(false);

  const handleIncreaseQuantity = async (itemId) => {
    await updateCartItemQuantity(itemId, 1);
  };

  const handleDecreaseQuantity = async (itemId) => {
    await updateCartItemQuantity(itemId, -1);
  };

  const handleRemoveItem = async (itemId) => {
    await removeCartItem(itemId);
  };

  const updateCartItemQuantity = async (itemId, change) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/update-cart',
        {
          itemId,
          change,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      getCartData();
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
    }
  };

  const removeCartItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/remove-cart-item',
        {
          itemId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      getCartData();
    } catch (error) {
      console.error('Error removing cart item:', error);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout', { state: { cartItems } });
  };

  return (
    <div className='menu'>
      <header>
        <Header />
      </header>
      <h1 id='menu-title'>MENU</h1>
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
                <Button variant='success' className='col-lg-6 text-center' onClick={() => handleAddToCart(el.id, el.itemname)}>
                  Add
                </Button>
              </Card.Body>
            </Card>
          ))}
          
      </div>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Item Added</Modal.Title>
        </Modal.Header>
        <Modal.Body>{addedItemName} has been added to your cart.</Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showCart} onHide={handleCartClose}>
        <Modal.Header closeButton>
          <Modal.Title>Cart Items</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {cartItems.length > 0 ? (
              cartItems.map((item, index) => (
                <ListGroup.Item key={index}>
                  {item.itemname} - {item.quantity} x ₱{item.price}
                  <Button variant='outline-primary' size='sm' onClick={() => handleIncreaseQuantity(item.id)}>
                    +
                  </Button>
                  <Button variant='outline-primary' size='sm' onClick={() => handleDecreaseQuantity(item.id)}>
                    -
                  </Button>
                  <Button variant='outline-danger' size='sm' onClick={() => handleRemoveItem(item.id)}>
                    Remove
                  </Button>
                </ListGroup.Item>
              ))
            ) : (
              <p>Your cart is empty</p>
            )}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleCartClose}>
            Close
          </Button>
          <Button variant='primary' onClick={handleCheckout}>
            Checkout
          </Button>
        </Modal.Footer>
      </Modal>
      </div>
  );
};

export default Menu;