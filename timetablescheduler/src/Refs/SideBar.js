import "./SideBar.css"
import { NavLink } from "react-router-dom";

function SideBar() {
   return (
      <aside className="sidebar">
         <h2>Admin Panel</h2>
         <ul>
            <li><NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>Dashboard</NavLink></li>
            <li><NavLink to="/teachers" className={({ isActive }) => (isActive ? "active" : "")}>Manage Teachers</NavLink></li>
            <li><NavLink to="/students" className={({ isActive }) => (isActive ? "active" : "")}>Manage Students</NavLink></li>
            <li><NavLink to="/courses" className={({ isActive }) => (isActive ? "active" : "")}>Manage Courses</NavLink></li>
            <li><NavLink to="/timetables" className={({ isActive }) => (isActive ? "active" : "")}>Create Timetable</NavLink></li>
            <li><NavLink to="/settings" className={({ isActive }) => (isActive ? "active" : "")}>Settings</NavLink></li>
         </ul>
      </aside>
   )
}

export default SideBar;