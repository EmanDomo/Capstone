import React, { useState, useEffect } from "react";
import "../../styles/Header.css";
import Logo from "../../Assets/logo.png";
import { Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { CiShoppingCart } from "react-icons/ci";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { jwtDecode } from 'jwt-decode';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { ListGroup } from 'react-bootstrap';
import axios from 'axios';

import { useNavigate } from 'react-router-dom'; // Import useNavigate


const Header = () => {
  const [data, setData] = useState([]);
  const [userName, setUserName] = useState('');
  const [openLinks, setOpenLinks] = useState(false);
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

  getCartData();
  
  const handleCheckout = () => {
    navigate('/checkout', { state: { cartItems } });
  };
  


  const toggleNavbar = () => {
    setOpenLinks(!openLinks);
  };
  return (
    <>
      <div className="navbar">
      <div className="leftSide" id={openLinks ? "open" : "close"}>
        <div className="app-logo">
            <img src={Logo} className="logo" alt="logo" />
            {/* <h2>Saint Jerome Integrated School of Cabuyao</h2> */}
            <h4 id="user-header">Welcome Back, {userName}!</h4>
        </div>
        <div className="hiddenLinks">
          <Link to="/"> Home </Link>
          <Link to="/Menu"> Menu </Link>
          <Link to="/Order"> Order </Link>
        </div>
      </div>
      <div className="rightSide">
          <Link to="/"> Home </Link>
          <Link to="/Menu"> Menu </Link>
          <Link onClick={handleCartShow}><CiShoppingCart /></Link>
          <Link to="/Admin" className="user"><HiOutlineUserCircle /></Link>
        <button onClick={toggleNavbar}>
          <GiHamburgerMenu />
        </button>
      </div>
    </div>
    <Modal show={showCart} onHide={handleCartClose}>
  <Modal.Header closeButton>
    <Modal.Title>Cart Items</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {cartItems.length > 0 ? (
      <div className="cartTable">
        <div className="cartTableHeader">
          <div className="headerCell">Name</div>
          <div className="headerCell">Quantity</div>
          <div className="headerCell">Price</div>
          <div className="headerCell">Actions</div>
        </div>
        {cartItems.map((item) => (
  <div className="cartTableRow" key={item.id}>
    <div className="cell">{item.itemname}</div>
    <div className="cell">{item.quantity}</div>
    <div className="cell">₱{item.price}</div>
    <div className="cell actions">
      <Button variant='outline-primary' size='sm' onClick={() => handleIncreaseQuantity(item.id)}>
        +
      </Button>
      <Button variant='outline-primary' size='sm' onClick={() => handleDecreaseQuantity(item.id)}>
        -
      </Button>
      <Button variant='outline-danger' size='sm' onClick={() => handleRemoveItem(item.id)}>
        Remove
      </Button>
    </div>
  </div>
))}

      </div>
    ) : (
      <p>Your cart is empty</p>
    )}
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

        </>
  );
};

export default Header;
