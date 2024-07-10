import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { BsCart4 } from "react-icons/bs";
import { Modal, Button, ListGroup } from "react-bootstrap";
import "../styles/Header.css";
import axios from 'axios';

const Header = () => {
  const [openLinks, setOpenLinks] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  const toggleNavbar = () => {
    setOpenLinks(!openLinks);
  };

  const handleCartShow = () => setShowCart(true);
  const handleCartClose = () => setShowCart(false);

  const fetchCartItems = async () => {
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

  useEffect(() => {
    fetchCartItems();
  }, []);

  const handleCheckout = () => {
    navigate('/checkout', { state: { cartItems } });
  };

  return (
    <>
      <div className="navbar">
        <div className="leftSide" id={openLinks ? "open" : "close"}>
          <div>
            <h2>STI</h2>
          </div>
        </div>
        <div className="rightSide">
          <Link to="/"> Home </Link>
          <Link to="/Menu"> Menu </Link>
          <Link to="#" onClick={handleCartShow}> <BsCart4 /> </Link>
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
          <ListGroup>
            {cartItems.length > 0 ? (
              cartItems.map((item, index) => (
                <ListGroup.Item key={index}>
                  {item.itemname} - {item.quantity} x ₱{item.price}
                </ListGroup.Item>
              ))
            ) : (
              <p>Your cart is empty</p>
            )}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCartClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCheckout}>
            Checkout
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Header;
