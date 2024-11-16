import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { MdOutlineLogin } from "react-icons/md";
import Modal from 'react-bootstrap/Modal';
import "../../styles/HeaderAdmin.css";
import Logo1 from "../../Assets/logo.png";
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';  
import { useNavigate } from 'react-router-dom';

function Header1() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleLogout = () => {
    setLoadingLogout(true); 
    setTimeout(() => {
      localStorage.removeItem('token');
      setLoadingLogout(false);
      navigate('/'); 
    }, 2000); 
  };
  
  return (
    <>
      <Navbar expand="lg" sticky="top" className="bg-body-tertiary admin-nav">
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
              <Nav.Link className="navlink-admin text-white" href="/ManageAccounts">Accounts</Nav.Link>
              <div className="d-flex">
                <Nav.Link onClick={() => setShowLogoutModal(true)} className='text-white ms-0 d-lg-block fs-4 logout-cashier'><MdOutlineLogin /></Nav.Link>
                <Nav.Link onClick={() => setShowLogoutModal(true)} className='text-white ms-2 d-lg-none d-sm-block'>Logout</Nav.Link>
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} dialogClassName="fullscreen-modal">
        <Modal.Header closeButton>
          <Modal.Title className='text-danger'>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to logout?</Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          {loadingLogout ? (
            <Button variant="dark" disabled>
              <Spinner animation="border" size="sm" />
              Logging out...
            </Button>
          ) : (
          <>
            <Button variant="dark cancel-logout" onClick={() => setShowLogoutModal(false)}>
              Cancel
            </Button>
            <Button variant="dark confirm-logout" onClick={handleLogout}>
              Yes
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
    </>
  );
}

export default Header1;
