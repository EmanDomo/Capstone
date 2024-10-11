import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import "../../styles/HeaderCashier.css";
import Logo1 from "../../Assets/logo.png";
import React, { useState, useEffect } from "react";
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode directly

function Header1() {
  const [userName, setUserName] = useState('');
  const [role, setRole] = useState(''); // State to store the role

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserName(decodedToken.name); // Extract name from token
      setRole(decodedToken.role); // Extract role from token
    }
  }, []);

  return (
    <Navbar expand="lg" className="bg-body-tertiary admin-nav">
      <Container>
        <Navbar.Brand href="/">
          <img
            alt="Logo"
            src={Logo1}
            className="d-inline-block align-top logo1"
          />{' '}
          {/* Display the name dynamically */}
          <label id='header-admin-title'>
            Welcome, Cashier!
          </label>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" id='toggle-nav' />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto mt-1">
            <Nav.Link href="/pos">POS</Nav.Link>
            <Nav.Link href="/orders">Orders</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header1;
