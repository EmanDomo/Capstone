import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import "../../styles/HeaderAdmin.css";
import Logo1 from "../../Assets/logo.png";
import React from 'react';

function Header1() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary admin-nav">
      <Container>
        <Navbar.Brand href="/">
          <img
            alt="Logo"
            src={Logo1}
            className="d-inline-block align-top logo1"
          />{' '}
          <label id='header-admin-title'>Welcome Admin!</label>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" id='toggle-nav'/>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto mt-1">
            <Nav.Link className="navlink-admin" href="/Inventory">Inventory</Nav.Link>
            <Nav.Link className="navlink-admin" href="/Sales">Sales</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header1;