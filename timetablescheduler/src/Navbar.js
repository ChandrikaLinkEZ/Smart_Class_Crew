import React, { useState } from "react"; // added useState import
import "./Navbar.css";
import { FaUser } from "react-icons/fa";

function Navbar({ title = "Dashboard", user, onLogout }) {   // ✅ accept onLogout as a prop
   const [dropdownOpen, setDropdownOpen] = useState(false);

   const handleToggle = () => {
      setDropdownOpen(!dropdownOpen);
   };

   return (
      <nav className="navbar">
         {/* Left: Title */}
         <div className="navbar-left">
            <h2>{title}</h2> {/* ✅ dynamic title */}
         </div>

         {/* Right: Profile */}
         <div className="navbar-right">
            <div className="profile" onClick={handleToggle}>
               <FaUser />
               <div className="profile-info">
                  <span className="role">
                     {user?.name || "Guest"}  {/* ✅ dynamic name */}
                  </span>
               </div>
            </div>

            {/* Dropdown */}
            {dropdownOpen && (
               <div className="dropdown">
                  <button onClick={onLogout}>Logout</button> {/* ✅ uses prop */}
               </div>
            )}
         </div>
      </nav>
   );
}

export default Navbar;
