import React, { useState, useEffect } from "react";
import Logo from "../../Assets/logo.png";
import { Link, useLocation } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoLogOutOutline } from "react-icons/io5";
import { IoIosNotifications } from "react-icons/io";
import { jwtDecode } from 'jwt-decode';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import axios from "axios";

import "../../styles/AdminHeader.css";

function AdminHeader() {
  const [openLinks, setOpenLinks] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [warningStocks, setWarningStocks] = useState([]);
  const [warningCount, setWarningCount] = useState(0);
  const location = useLocation(); // Get current location

  const handleCloseModal = () => setShowModal(false);

  const toggleNavbar = () => {
    setOpenLinks(!openLinks);
  };

  const getWarningStocksData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decodedToken = jwtDecode(token);
        // Handle decoded token if needed
      }

      const res = await axios.get("/warning-stocks", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.length > 0) {
        setWarningStocks(res.data);
        setWarningCount(res.data.length);
        setShowModal(false);
      } else {
        setShowModal(false);
      }
    } catch (err) {
      console.error("Error fetching warning stocks:", err);
    }
  };

  useEffect(() => {
    getWarningStocksData(); // Fetch data on component mount
  }, []); // Empty dependency array ensures this runs once on mount

  useEffect(() => {
    if (showModal) {
      setShowModal(false); // Close the modal on route change
    }
  }, [location]);

  return (
    <div className="navbar">
      <div className="leftSide" id={openLinks ? "open" : "close"}>
        <div className="app-logo">
          <img src={Logo} className="logo" alt="logo" />
        </div>
        <div className="hiddenLinks">
          <Link to="/"> POS </Link>
          <Link to="/Menu"> Inventory </Link>
          <Link to="/Order"> Orders </Link>
          <Link to="/sales"> Sales </Link>
          <div className="notification-icon" onClick={getWarningStocksData}>
            <IoIosNotifications />
            {warningCount > 0 && (
              <span className="notification-badge">{warningCount}</span>
            )}
          </div>
        </div>
      </div>
      <div className="rightSide">
        <Link to="/admin"> POS </Link>
        <Link to="/inventory"> Inventory </Link>
        <Link to="/orders"> Orders </Link>
        <div className="notification-icon" onClick={getWarningStocksData}>
          <IoIosNotifications />
          {warningCount > 0 && (
            <span className="notification-badge">{warningCount}</span>
          )}
        </div>
        <Link to="/" className="user">
          <IoLogOutOutline />
        </Link>
        <button onClick={toggleNavbar}>
          <GiHamburgerMenu />
        </button>
      </div>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Warning Stocks</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {warningStocks.length > 0 ? (
            <ul>
              {warningStocks.map((stock) => (
                <li key={stock.id}>
                  {stock.stock_item_name}: {stock.stock_quantity} {stock.unit}
                </li>
              ))}
            </ul>
          ) : (
            <p>No stocks below warning level.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default AdminHeader;
