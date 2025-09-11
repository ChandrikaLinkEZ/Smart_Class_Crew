import { useEffect, useState } from "react";
import "./GenerateTimetable.css";
import { NavLink } from "react-router-dom";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import ReactModal from "react-modal";

ReactModal.setAppElement("#root");

function GenerateTimetable() {
   const [user, setUser] = useState(null);
   const navigate = useNavigate();
   const [semester, setSemester] = useState("");
   const [department, setDepartment] = useState("");
   const [division, setDivision] = useState("");

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

   const handleFetch = () => {
      console.log("Fetch timetable for:", { semester, department, division });
      // 🔗 Call API here
   };

   return (
      <div className="manage-container">
         {/* Sidebar */}
         <aside className="sidebar">
            <h2>Admin Panel</h2>
            <ul>
               <li><NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>Dashboard</NavLink></li>
               <li><NavLink to="/teachers" className={({ isActive }) => (isActive ? "active" : "")}>Manage Teachers</NavLink></li>
               <li><NavLink to="/students" className={({ isActive }) => (isActive ? "active" : "")}>Manage Students</NavLink></li>
               <li><NavLink to="/courses" className={({ isActive }) => (isActive ? "active" : "")}>Manage Courses</NavLink></li>
               <li><NavLink to="/timetable" className={({ isActive }) => (isActive ? "active" : "")}>Generate Timetable</NavLink></li>
               <li><NavLink to="/settings" className={({ isActive }) => (isActive ? "active" : "")}>Settings</NavLink></li>
            </ul>
         </aside>

         {/* Main */}
         <div className="student">
            <Navbar title="Generate Timetable" user={user} onLogout={handleLogout} />

            <div className="timetable-card">

               <div className="form-grid">
                  {/* Semester */}
                  <div className="form-group">
                     <label>Semester</label>
                     <select value={semester} onChange={(e) => setSemester(e.target.value)}>
                        <option value="">Select Semester</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                           <option key={num} value={num}>Semester {num}</option>
                        ))}
                     </select>
                  </div>

                  {/* Department */}
                  <div className="form-group">
                     <label>Department</label>
                     <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                        <option value="">Select Department</option>
                        <option value="CSE">Computer Science</option>
                        <option value="ECE">Electronics</option>
                        <option value="ME">Mechanical</option>
                        <option value="CE">Civil</option>
                        <option value="EE">Electrical</option>
                     </select>
                  </div>

                  {/* Division */}
                  <div className="form-group">
                     <label>Division</label>
                     <select value={division} onChange={(e) => setDivision(e.target.value)}>
                        <option value="">Select Division</option>
                        <option value="A">Division A</option>
                        <option value="B">Division B</option>
                        <option value="C">Division C</option>
                     </select>
                  </div>

                  <button
                     className="fetch-btn"
                     onClick={handleFetch}
                     disabled={!semester || !department || !division}
                  >
                     Fetch Timetable
                  </button>

               </div>

            </div>
         </div>
      </div>
   );
}

export default GenerateTimetable;
