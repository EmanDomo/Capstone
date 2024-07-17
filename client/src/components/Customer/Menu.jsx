import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Header from './Header';
import axios from 'axios';
import moment from 'moment';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import { jwtDecode } from 'jwt-decode';
import { ListGroup, Row, Col, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';

const Menu = () => {
  const [data, setData] = useState([]);
  const [userName, setUserName] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [addedItemName, setAddedItemName] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
        setData(res.data.data);
      } else {
        setError('Error fetching data');
      }
    } catch (error) {
      setError('Error fetching data');
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
        setError('Error fetching cart data');
      }
    } catch (error) {
      setError('Error fetching cart data');
    }
  };

  const handleAddToCart = async (itemId, itemName) => {
    const quantity = 1;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        '/add-to-cart',
        { itemId, quantity },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (res.data.status === 'success') {
        setAddedItemName(itemName);
        setShowModal(true);
        getCartData();
      } else if (res.data.message === 'Item already in cart') {
        setAddedItemName(`${itemName} is already in the cart`);
        setShowModal(true);
      } else {
        setError('Error adding item to cart');
      }
    } catch (error) {
      setError('Error adding item to cart');
    }
  };

  const handleCloseModal = () => setShowModal(false);

  const handleCartShow = () => setShowCart(true);
  const handleCartClose = () => setShowCart(false);

  const handleIncreaseQuantity = (index) => {
    const updatedCart = cartItems.map((item, i) => (
      i === index ? { ...item, quantity: item.quantity + 1 } : item
    ));
    setCartItems(updatedCart);
  };
  
  const handleDecreaseQuantity = (index) => {
    const updatedCart = cartItems.map((item, i) => (
      i === index ? { ...item, quantity: item.quantity > 0 ? item.quantity - 1 : 0 } : item
    ));
    setCartItems(updatedCart);
  };
  
  const handleCheckout = () => {
    const grandTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    navigate('/checkout', { state: { cartItems, grandTotal } });
  };
  
  const handleRemoveItem = async (itemId, index) => {
    console.log(`Attempting to remove item with id: ${itemId} at index: ${index}`);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        '/remove-cart-item',
        { itemId },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        }
      );
  
      if (res.data.status === 'success') {
        // Remove the item from the front-end state only if the back-end deletion is successful
        const updatedCart = cartItems.filter((_, i) => i !== index);
        setCartItems(updatedCart);
      } else {
        setError('Error removing item from cart');
      }
    } catch (error) {
      setError('Error removing item from cart');
    }
  };
  
  return (
    <>
      <header>
        <Header />
      </header>
      <h3>Welcome Back, {userName}!</h3>
      <Button onClick={handleCartShow}>View Cart</Button>
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
                <Button
                  variant='success'
                  className='col-lg-6 text-center'
                  onClick={() => handleAddToCart(el.id, el.itemname)}
                >
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

      <Modal show={showCart} onHide={handleCartClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Cart Items</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
          {error && <Alert variant="danger">{error}</Alert>}
          <ListGroup>
            {cartItems.length > 0 ? (
              cartItems.map((item, index) => (
                <ListGroup.Item key={index}>
                  <Container>
                    <Row className="align-items-center">
                      <Col xs={4}>
                        {item.itemname}
                      </Col>
                      <Col xs={3}>
                        <div className="d-flex align-items-center">
                          <Button variant='outline-primary' size='sm' onClick={() => handleDecreaseQuantity(index)}>-</Button>
                          <span className="mx-2">{item.quantity}</span>
                          <Button variant='outline-primary' size='sm' onClick={() => handleIncreaseQuantity(index)}>+</Button>
                        </div>
                      </Col>
                      <Col xs={3} className="text-right">
                        <Button variant='outline-danger' size='sm' onClick={() => handleRemoveItem(item.id, index)}>Remove</Button>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={{ span: 3, offset: 5 }}>
                        <span>₱{item.price * item.quantity}.00</span>
                      </Col>
                    </Row>
                  </Container>
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
          {cartItems.length > 0 && (
            <Button variant='primary' onClick={handleCheckout}>
              Checkout
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Menu;
