import React, { useState } from "react";
import { Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import "../styles/Header.css";

const Header = () => {
const [openLinks, setOpenLinks] = useState(false);

  const toggleNavbar = () => {
    setOpenLinks(!openLinks);
  };
  return (
    <div className="navbar">
      <div className="leftSide" id={openLinks ? "open" : "close"}>
        <div>
        <h2>STI</h2>
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
          <Link to="/Order"> Order </Link>
        <button onClick={toggleNavbar}>
          <GiHamburgerMenu />
        </button>
      </div>
    </div>
  );
}

export default Header