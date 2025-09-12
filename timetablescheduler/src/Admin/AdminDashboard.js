import React, { useEffect, useState } from "react";
import Navbar from "../Refs/Navbar";
import SideBar from "../Refs/SideBar";
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS = ["#FF9F80", "#3C3C92"]; // Orange for Male, Blue for Female

function AdminDashboard() {
   const [user, setUser] = useState(null);
   const navigate = useNavigate();
   const [stats, setStats] = useState({
      students_count: 0,
      teachers_count: 0,
      male_students: 0,
      female_students: 0,
      male_percent: 0,
      female_percent: 0,
   });
   const [date, setDate] = useState(new Date());
   const [holidays, setHolidays] = useState([]);

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

   // Fetch holidays
   useEffect(() => {
      const fetchHolidays = async () => {
         try {
            const response = await fetch("http://127.0.0.1:5000/api/holidays");
            const data = await response.json();
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

   return (
      <div className="admin-container">
         <SideBar />

         <main className="dashboard">
            <Navbar title="Dashboard" user={user} onLogout={handleLogout} />

            <div className="dashboardBody">
               {/* Left side */}
               <div className="leftSide">
                  <div className="card-grid">
                     <div className="card"><p>Students</p><b>{stats.students_count || 0}</b></div>
                     <div className="card"><p>Teachers</p><b>{stats.teachers_count || 0}</b></div>
                     <div className="card"><p>Total Courses</p><b>{stats.courses_count || 0}</b></div>
                     <div className="card"><p>Total Divisions</p><b>{stats.divisions_count || 0}</b></div>
                  </div>

                  <div className="belowGrid">
                     <div className="holiday-card">
                        <h3>Holiday List</h3>
                        <div className="holiday-table-wrapper">
                           <table className="holiday-table">
                              <thead>
                                 <tr>
                                    <th>Date</th>
                                    <th>Day</th>
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
                                          <td>{holiday.day}</td>
                                          <td>{holiday.name}</td>
                                       </tr>
                                    ))
                                 ) : (
                                    <tr>
                                       <td colSpan="3">No holidays found</td>
                                    </tr>
                                 )}
                              </tbody>
                           </table>
                        </div>
                     </div>

                     <div className="students-chart card">
                        <h3>Students</h3>
                        <PieChart width={230} height={250}>
                           <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              isAnimationActive={true}
                              innerRadius={70}
                              outerRadius={110}
                              paddingAngle={3}
                              dataKey="value"
                           >
                              {pieData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                           </Pie>
                           <Tooltip />
                        </PieChart>
                        <div className="students-legend">
                           <p style={{ color: COLORS[0] }}>Male {stats.male_percent}%</p>
                           <p style={{ color: COLORS[1] }}>Female {stats.female_percent}%</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right side */}
               <div className="rightSide">
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
