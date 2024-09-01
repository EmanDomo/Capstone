import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Header from './Header';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import { ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../../styles/Menu.css';

const Menu = () => {
  const [data, setData] = useState([]);
  const [topSellingItems, setTopSellingItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [addedItemName, setAddedItemName] = useState('');
  const [showCart, setShowCart] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getUserData();
    getTopSellingItems();
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
        console.log('Error fetching data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getTopSellingItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/top-selling', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        setTopSellingItems(res.data.data);
      } else {
        console.log('Error fetching top-selling items');
      }
    } catch (error) {
      console.error('Error fetching top-selling items:', error);
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
    <div className='menu' style={{ maxHeight: '100vh', overflowY: 'auto' }}>
      <header>
        <Header />
      </header>

      <h1 id='menu-title'>Top Selling Items</h1>
      <div className='top-selling-items'>
        {topSellingItems.length > 0 ? (
          topSellingItems.map((item, index) => (
            <div key={index} className='menu-item'>
              <img
                variant='top'
                src={`/uploads/${item.img}`}
                className="menu-itm" alt="itm"
              />
              <div className='text-container'>
                <h3 className='menu-text'>{item.itemname}</h3>
                <label className='menu-text1'>₱{item.price}</label>
                <button className="btnMenuItem" onClick={() => handleAddToCart(item.id, item.itemname)}>Add to Cart</button>
              </div>
            </div>
          ))
        ) : (
          <p>No top-selling items available.</p>
        )}
      </div>

      <h1 id='menu-title'>Menu</h1>
      <div className='menu-items'>
        {data.length > 0 ? (
          data.map((el, i) => (
            <div key={i} className='menu-item'>
              <img
                variant='top'
                src={`/uploads/${el.img}`}
                className="menu-itm" alt="itm"
              />
              <div className='text-container'>
                <h3 className='menu-text'>{el.itemname}</h3>
                <label className='menu-text1'>₱{el.price}</label>
                <button className="btnMenuItem" onClick={() => handleAddToCart(el.id, el.itemname)}>Add to Cart</button>
              </div>
            </div>
          ))
        ) : (
          <p>No items available in the menu.</p>
        )}
      </div>

      {/* Modals */}
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