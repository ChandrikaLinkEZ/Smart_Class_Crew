import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Navbar from "./Navbar";
import "./AdminDashboard.css";
import { useNavigate, useLocation } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { PieChart, Pie, Cell } from "recharts";

const COLORS = ["#FF9F80", "#3C3C92"]; // Orange for Male, Blue for Female

function AdminDashboard() {
   const navigate = useNavigate();
   const location = useLocation();
   const [stats, setStats] = useState({
      students_count: 0,
      teachers_count: 0,
      male_students: 0,
      female_students: 0,
      male_percent: 0,
      female_percent: 0,
   });
   const [date, setDate] = useState(new Date());
   const [notices, setNotices] = useState([]);
   const [holidays, setHolidays] = useState([]);  // ✅ Add holidays state

   const handleLogout = () => {
      console.log("Logged out!");
      navigate("/");
   };

   const pieData = [
      { name: "Male", value: stats.male_students },
      { name: "Female", value: stats.female_students },
   ];

   // Fetch stats
   useEffect(() => {
      const fetchStats = async () => {
         try {
            const response = await fetch("http://127.0.0.1:5000/api/stats");
            const data = await response.json();
            setStats(data);
         } catch (error) {
            console.error("Error fetching stats:", error);
         }
      };
      fetchStats();
   }, []);

   // Fetch notices
   useEffect(() => {
      const fetchNotices = async () => {
         try {
            const response = await fetch("http://127.0.0.1:5000/api/notices");
            const data = await response.json();
            setNotices(data);
         } catch (error) {
            console.error("Error fetching Notices:", error);
         }
      };
      fetchNotices();
   }, []);

   // Fetch holidays
   useEffect(() => {
      const fetchHolidays = async () => {
         try {
            const response = await fetch("http://127.0.0.1:5000/api/holidays");
            const data = await response.json();
            console.log("📅 Holidays:", data);

            // Ensure always an array
            if (Array.isArray(data)) {
               setHolidays(data);
            } else {
               setHolidays([]);
            }
         } catch (error) {
            console.error("Error fetching holidays:", error);
            setHolidays([]);
         }
      };
      fetchHolidays();
   }, []);


   const isHoliday = date =>
      holidays.some(h => h.date === date.toISOString().split("T")[0]);

   return (
      <div className="admin-container">
         <aside className="sidebar">
            <h2>Admin Panel</h2>
            <ul>
               <li>
                  <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
                     Dashboard
                  </NavLink>
               </li>
               <li>
                  <NavLink to="/teachers" className={({ isActive }) => (isActive ? "active" : "")}>
                     Manage Teachers
                  </NavLink>
               </li>
               <li>
                  <NavLink to="/courses" className={({ isActive }) => (isActive ? "active" : "")}>
                     Manage Courses
                  </NavLink>
               </li>
               <li>
                  <NavLink to="/students" className={({ isActive }) => (isActive ? "active" : "")}>
                     Manage Students
                  </NavLink>
               </li>
               <li>
                  <NavLink to="/timetable" className={({ isActive }) => (isActive ? "active" : "")}>
                     Generate Timetable
                  </NavLink>
               </li>
               <li>
                  <NavLink to="/settings" className={({ isActive }) => (isActive ? "active" : "")}>
                     Settings
                  </NavLink>
               </li>
            </ul>
         </aside>

         <main className="dashboard">
            <Navbar onLogout={handleLogout} />

            <div className="dashboardBody">

               <div className="leftSide">
                  <div className="card-grid">
                     <div className="card"><p>Students</p><b>{stats.students_count}</b></div>
                     <div className="card"><p>Teachers</p><b>{stats.teachers_count}</b></div>
                     <div className="card"><p>Manage Timeslots</p><b>Go</b></div>
                     <div className="card"><p>Generate Timetable</p><b>Go</b></div>
                  </div>

                  <div className="belowGrid">
                     {/* ✅ Notice Board */}
                     {/* <div className="notice-board card">
                        <h3>Notice Board</h3>
                        <p className="subtitle">Create a notice or find messages for you!</p>

                        <ul className="notice-list">
                           {notices.map((notice, index) => (
                              <li key={index} className="notice-item">
                                 {notice.image && (
                                    <img src={notice.image} alt="notice" className="notice-img" />
                                 )}
                                 <div className="notice-content">
                                    <p className="notice-title">{notice.title}</p>
                                    <span className="notice-date">
                                       {new Date(notice.date).toLocaleDateString("en-GB", {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                       })}
                                    </span>
                                 </div>
                                 <div className="notice-views">
                                    <span className="views">{notice.views}</span>
                                 </div>
                              </li>
                           ))}
                        </ul>
                     </div> */}

                     <div className="rightSide">
                        <div className="calendar-card">
                           <h3>Holiday List</h3>

                           <table className="holiday-table">
                              <thead>
                                 <tr>
                                    <th>Date</th>
                                    <th>Holiday</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {holidays.length > 0 ? (
                                    holidays.map((holiday, index) => (
                                       <tr key={index}>
                                          <td>
                                             {new Date(holiday.date).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                             })}
                                          </td>
                                          <td>{holiday.title}</td>
                                       </tr>
                                    ))
                                 ) : (
                                    <tr>
                                       <td colSpan="2">No holidays found</td>
                                    </tr>
                                 )}
                              </tbody>
                           </table>
                        </div>
                     </div>

                     {/* ✅ Students Chart */}
                     <div className="students-chart card">
                        <h3>Students</h3>
                        <PieChart width={250} height={250}>
                           <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={5}
                              dataKey="value"
                           >
                              {pieData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                           </Pie>
                        </PieChart>
                        <div className="students-legend">
                           <p style={{ color: COLORS[0] }}>Male {stats.male_percent}%</p>
                           <p style={{ color: COLORS[1] }}>Female {stats.female_percent}%</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="rightSide">
                  {/* ✅ Calendar with Holidays */}
                  <div className="calendar-card">
                     <h3>Event Calendar</h3>
                     <Calendar
                        onChange={setDate}
                        value={date}
                        calendarType="gregory"
                        formatMonthYear={(locale, date) =>
                           date.toLocaleDateString(locale, { month: "short", year: "numeric" })
                        }
                     />
                  </div>
               </div>
            </div>
         </main>
      </div>
   );
}

export default AdminDashboard;
