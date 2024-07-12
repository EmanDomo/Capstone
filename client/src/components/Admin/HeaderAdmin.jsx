import React, { useState } from "react";
import { Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import '../../styles/AdminHeader.css';

function AdminHeader() {
  const [openLinks, setOpenLinks] = useState(false);

  const toggleNavbar = () => {
    setOpenLinks(!openLinks);
  };
  return (
    <div className="navbar">
      <div className="leftSide" id={openLinks ? "open" : "close"}>
        <div className="hiddenLinks">
          <Link to="/"> Home </Link>
          <Link to="/Admin"> POS </Link>
          <Link to="#"> Order </Link>
          <Link to="#"> Inventory </Link>
        </div>
      </div>
      <div className="rightSide">
          <Link to="/"> Home </Link>
          <Link to="/Admin"> POS </Link>
          <Link to="#"> Order </Link>
          <Link to="#"> Inventory </Link>
        <button onClick={toggleNavbar}>
          <GiHamburgerMenu />
        </button>
      </div>
    </div>
  );
}

export default AdminHeader;
