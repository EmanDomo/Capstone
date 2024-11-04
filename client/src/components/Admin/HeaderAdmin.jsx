import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { MdOutlineLogin } from "react-icons/md";
import Modal from 'react-bootstrap/Modal';
import "../../styles/HeaderAdmin.css";
import Logo1 from "../../Assets/logo.png";
import Button from 'react-bootstrap/Button';

function Header1() {
  const [showModal, setShowModal] = useState(false);

  const handleLogoutClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleConfirmLogout = () => {
    window.location.href = '/'; 
  };

  return (
    <>
      <Navbar expand="lg" className="bg-body-tertiary admin-nav">
        <Container>
          <Navbar.Brand href="/">
            <img
              alt="Logo"
              src={Logo1}
              className="d-inline-block align-top logo1"
            />{' '}
            <label id='header-admin-title' className='text-white'>Welcome Admin!</label>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" id='toggle-nav' />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto mt-1">
              <Nav.Link className="navlink-admin text-white" href="/Inventory">Inventory</Nav.Link>
              <Nav.Link className="navlink-admin text-white" href="/Sales">Sales</Nav.Link>
              <div className="d-flex">
                <Nav.Link onClick={handleLogoutClick} className='text-white ms-0 d-lg-block d-sm-none fs-4 logout-customer'>
                  <MdOutlineLogin />
                </Nav.Link>
                <Nav.Link onClick={handleLogoutClick} className='text-white ms-2 d-lg-none d-sm-block'>
                  Logout
                </Nav.Link>
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={handleCloseModal} dialogClassName="fullscreen-modal">
        <Modal.Header closeButton>
          <Modal.Title className='text-danger'>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to logout?</Modal.Body>
        <Modal.Footer className='d-flex justify-content-between'>
          <Button variant="dark cancel-logout" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="dark confirm-logout" onClick={handleConfirmLogout}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Header1;
