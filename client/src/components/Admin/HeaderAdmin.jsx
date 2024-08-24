import React, { useState } from "react";
import Logo from "../../Assets/logo.png";
import { Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoLogOutOutline } from "react-icons/io5";
import "../../styles/AdminHeader.css";

function AdminHeader() {
  const [openLinks, setOpenLinks] = useState(false);

  const toggleNavbar = () => {
    setOpenLinks(!openLinks);
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
        </div>
      </div>
      <div className="rightSide">
          <Link to="/admin"> POS </Link>
          <Link to="/inventory"> Inventory </Link>
          <Link to="/orders">Orders</Link>
          <Link to="/" className="user"><IoLogOutOutline /></Link>
        <button onClick={toggleNavbar}>
          <GiHamburgerMenu />
        </button>
      </div>
    </div>
  );
}

export default AdminHeader;
