import React, { useState } from "react";
import Logo from "../../Assets/logo.png";
import { Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoLogOutOutline } from "react-icons/io5";
import { IoIosNotifications } from "react-icons/io";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button"; // Ensure Button is imported
import axios from "axios"; // Import axios

import "../../styles/AdminHeader.css";

function AdminHeader() {
  const [openLinks, setOpenLinks] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [warningStocks, setWarningStocks] = useState([]); // State to hold warning stocks data
  const [warningCount, setWarningCount] = useState(0); // State to hold the count of warning stocks

  const handleCloseModal = () => setShowModal(false);
  
  const toggleNavbar = () => {
    setOpenLinks(!openLinks);
  };

  // This function will now be called only when the notification icon is clicked
  const getWarningStocksData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/warning-stocks", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data) {
        setWarningStocks(res.data); // Store the response data in the state
        setWarningCount(res.data.length); // Update the count of warning stocks
        setShowModal(true); // Show modal if data is successfully fetched
      }
    } catch (err) {
      console.error("Error fetching warning stocks:", err);
    }
  };

  return (
    <div className="navbar">
      <div className="leftSide" id={openLinks ? "open" : "close"}>
        <div className="app-logo">
          <img src={Logo} className="logo" alt="logo" />
          {/* <h2>Saint Jerome Integrated School of Cabuyao</h2> */}
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
