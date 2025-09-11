import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import SideBar from "../Refs/SideBar";
import Navbar from "../Refs/Navbar";

function GeneratedTimetables() {
   const [user, setUser] = useState(null);
   const navigate = useNavigate();

   const handleLogout = () => {
      console.log("Logged out!");
      navigate("/");
   };

   useEffect(() => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
         setUser(JSON.parse(storedUser));
      }
   }, []);

   return (
      <div className="manage-container">
         <SideBar />

         <div className="student">
            <Navbar title="Generated Timetables" user={user} onLogout={handleLogout} />
         </div>
      </div>
   )
}

export default GeneratedTimetables;