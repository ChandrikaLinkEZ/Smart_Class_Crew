import React, { useState } from "react"; // added useState import
import "./Navbar.css";
import { FaUser } from "react-icons/fa";

function Navbar({ onLogout }) {   // ✅ accept onLogout as a prop
   const [dropdownOpen, setDropdownOpen] = useState(false);

   const handleToggle = () => {
      setDropdownOpen(!dropdownOpen);
   };

   return (
      <nav className="navbar">
         {/* Left: Title */}
         <div className="navbar-left">
            <h2>Admin Dashboard</h2>
         </div>

         {/* Right: Profile */}
         <div className="navbar-right">
            <div className="profile" onClick={handleToggle}>
               <FaUser />
               <div className="profile-info">
                  <span className="role">Admin</span>
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
