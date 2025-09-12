import { useEffect, useState } from "react";
import "./GenerateTimetable.css";
import Navbar from "../Refs/Navbar";
import SideBar from "../Refs/SideBar";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

function GenerateTimetable() {
   const [user, setUser] = useState(null);
   const navigate = useNavigate();
   const [semester, setSemester] = useState("");
   const [degree, setDegree] = useState("");
   const [department, setDepartment] = useState("");
   const [division, setDivision] = useState("");
   const [timetable, setTimetable] = useState(null);
   const [activeTab, setActiveTab] = useState("create"); // "add" = edit/delete, "view" = readonly
   const [loading, setLoading] = useState(false);
   const [allTimetables, setAllTimetables] = useState(null); // for "view"


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

   const handleFetch = async () => {
      setLoading(true);
      setTimetable(null);

      try {
         const response = await fetch("http://localhost:5000/api/timetable/fetch", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({ semester, department, division }),
         });

         if (!response.ok) {
            throw new Error("Failed to fetch timetable");
         }

         const data = await response.json();
         setTimetable(data);
      } catch (error) {
         console.error("Error fetching timetable:", error);
         toast.error("Failed to fetch timetable. Please try again.");
      } finally {
         setLoading(false);
      }
   };

   // Auto-fetch all timetables when switching to "view"
   useEffect(() => {
      if (activeTab === "view") {
         const fetchAll = async () => {
            setLoading(true);
            try {
               const response = await fetch("http://localhost:5000/api/timetable/all", {
                  method: "GET",
                  headers: {
                     "Content-Type": "application/json",
                  },
               });

               if (!response.ok) {
                  throw new Error("Failed to fetch timetables");
               }

               const data = await response.json();
               setAllTimetables(data); // expected { A: [...], B: [...], ... }
            } catch (error) {
               console.error("Error fetching all timetables:", error);
               toast.error("Failed to fetch all timetables.");
            } finally {
               setLoading(false);
            }
         };

         fetchAll();
      }
   }, [activeTab]);

   return (
      <div className="manage-container">

         <ToastContainer position="top-right" autoClose={3000} />

         <SideBar />

         {/* Main */}
         <div className="student">
            <Navbar title="Generate Timetable" user={user} onLogout={handleLogout} />

            {/* Tabs */}
            <div className="tabs">
               <button
                  className={`tab ${activeTab === "create" ? "active-tab" : ""}`}
                  onClick={() => setActiveTab("create")}
               >
                  Create
               </button>
               <button
                  className={`tab ${activeTab === "view" ? "active-tab" : ""}`}
                  onClick={() => setActiveTab("view")}
               >
                  View
               </button>
            </div>

            {activeTab === "create" && (
               <div className="timetable-card">

                  <div className="generate-grid">
                     {/* Degree */}
                     <div className="generate-group">
                        <label>Degree</label>
                        <input
                           id="degree"
                           placeholder="Select Degree"
                           value={degree}
                           onChange={(e) => setDegree(e.target.value)}
                           required
                        >
                        </input>
                     </div>

                     {/* Semester */}
                     <div className="generate-group">
                        <label>Semester</label>
                        <select
                           id="semester"
                           placeholder="Select Semester"
                           value={semester}
                           onChange={(e) => setSemester(e.target.value)}
                           required
                        >
                           <option value="" disabled hidden>Select Semester</option>
                           <option value="1">Semester 1</option>
                           <option value="2">Semester 2</option>
                           <option value="3">Semester 3</option>
                           <option value="4">Semester 4</option>
                           <option value="5">Semester 5</option>
                           <option value="6">Semester 6</option>
                           <option value="7">Semester 7</option>
                           <option value="8">Semester 8</option>
                        </select>
                     </div>

                     {/* Department */}
                     <div className="generate-group">
                        <label>Department</label>
                        <select
                           id="department"
                           value={department}
                           onChange={(e) => setDepartment(e.target.value)}
                           required
                        >
                           <option value="" disabled>Select Department</option>
                           <option value="CSE">Computer Science</option>
                           <option value="ECE">Electronics</option>
                           <option value="ME">Mechanical</option>
                           <option value="CE">Civil</option>
                           <option value="EE">Electrical</option>
                        </select>
                     </div>

                     {/* Division */}
                     <div className="generate-group">
                        <label>Division</label>
                        <select
                           id="division"
                           value={division}
                           onChange={(e) => setDivision(e.target.value)}
                           required
                        >
                           <option value="" disabled>Select Division</option>
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

                  {/* Timetable Display */}

                  <div className="timetable-display">
                     <h3>Generated Timetable</h3>
                     <table className="timetable-table">
                        <thead>
                           <tr>
                              <th>Day</th>
                              <th>9:00 - 10:00</th>
                              <th>10:00 - 11:00</th>
                              <th>11:00 - 12:00</th>
                              <th>1:00 - 2:00</th>
                              <th>2:00 - 3:00</th>
                              <th>3:00 - 4:00</th>
                           </tr>
                        </thead>
                        {timetable && (
                           <tbody>
                              {timetable.map((row, index) => (
                                 <tr key={index}>
                                    <td>{row.day}</td>
                                    <td>{row.slot1 || "-"}</td>
                                    <td>{row.slot2 || "-"}</td>
                                    <td>{row.slot3 || "-"}</td>
                                    <td>{row.slot4 || "-"}</td>
                                    <td>{row.slot5 || "-"}</td>
                                    <td>{row.slot6 || "-"}</td>
                                 </tr>
                              ))}
                           </tbody>
                        )}
                     </table>
                  </div>
               </div>
            )}

            {/* VIEW TAB */}
            {activeTab === "view" && (
               <div className="timetable-card">
                  {loading && <p>Loading timetables...</p>}

                  {!loading && allTimetables &&
                     Object.entries(allTimetables).map(([divisionKey, schedule]) => (
                        <div key={divisionKey} className="timetable-display">
                           <h3>Division {divisionKey}</h3>
                           <table className="timetable-table">
                              <thead>
                                 <tr>
                                    <th>Day</th>
                                    <th>9:00 - 10:00</th>
                                    <th>10:00 - 11:00</th>
                                    <th>11:00 - 12:00</th>
                                    <th>1:00 - 2:00</th>
                                    <th>2:00 - 3:00</th>
                                    <th>3:00 - 4:00</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {schedule.map((row, index) => (
                                    <tr key={index}>
                                       <td>{row.day}</td>
                                       <td>{row.slot1 || "-"}</td>
                                       <td>{row.slot2 || "-"}</td>
                                       <td>{row.slot3 || "-"}</td>
                                       <td>{row.slot4 || "-"}</td>
                                       <td>{row.slot5 || "-"}</td>
                                       <td>{row.slot6 || "-"}</td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     ))}
               </div>
            )}
         </div>
      </div>
   );
}

export default GenerateTimetable;
