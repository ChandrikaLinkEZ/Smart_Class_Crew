import { useEffect, useState } from "react";
import "./ManageStudents.css";
import { NavLink } from "react-router-dom";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx"; // ⬅️ add at top

function ManageStudents() {
   const [students, setStudents] = useState([]);
   const [selectedStudent, setSelectedStudent] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const navigate = useNavigate();
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
   const [studentToDelete, setStudentToDelete] = useState(null);
   const [currentPage, setCurrentPage] = useState(1);
   const [activeTab, setActiveTab] = useState("all"); // ✅ tab state
   const rowsPerPage = 5;

   // Calculate indexes
   const indexOfLastRow = currentPage * rowsPerPage;
   const indexOfFirstRow = indexOfLastRow - rowsPerPage;
   const currentStudents = students.slice(indexOfFirstRow, indexOfLastRow);
   const totalPages = Math.ceil(students.length / rowsPerPage);

   // Handle page change
   const goToPage = (page) => {
      if (page >= 1 && page <= totalPages) {
         setCurrentPage(page);
      }
   };

   const handleLogout = () => {
      console.log("Logged out!");
      navigate("/");
   };

   useEffect(() => {
      fetch("http://localhost:5000/api/students")
         .then((res) => res.json())
         .then((data) => setStudents(data))
         .catch((err) => console.error("Error fetching students:", err));
   }, []);

   const handleEdit = (student) => {
      setSelectedStudent({ ...student }); // copy
      setIsModalOpen(true);
   };

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setSelectedStudent((prev) => ({
         ...prev,
         [name]: value,
      }));
   };

   const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
         const data = new Uint8Array(event.target.result);
         const workbook = XLSX.read(data, { type: "array" });
         const sheetName = workbook.SheetNames[0];
         const sheet = workbook.Sheets[sheetName];
         const rows = XLSX.utils.sheet_to_json(sheet);

         // ✅ Normalize rows into students format
         const newStudents = rows.map((row, index) => ({
            id: Date.now().toString() + index,
            name: row.Name || "",
            email: row.Email || "",
            usn: row.USN || "",
            division: row.Division || "",  // ✅ match your Excel header
         }));

         setStudents(newStudents);
         setCurrentPage(1);
      };

      reader.readAsArrayBuffer(file);
   };

   const handleSave = () => {
      setStudents((prev) => {
         const exists = prev.some((stu) => stu.id === selectedStudent.id);
         return exists
            ? prev.map((stu) =>
               stu.id === selectedStudent.id ? { ...selectedStudent } : stu
            )
            : [...prev, selectedStudent];
      });
      setIsModalOpen(false);
      setSelectedStudent(null);
   };

   const handleDelete = (student) => {
      setStudentToDelete(student);
      setIsDeleteModalOpen(true);
   };

   const confirmDelete = () => {
      setStudents((prev) => prev.filter((stu) => stu.id !== studentToDelete.id));
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
   };

   const handleSaveAll = () => {
      fetch("http://localhost:5000/api/students/bulk-update", {
         method: "PUT",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify(students),
      })
         .then((res) => {
            if (!res.ok) throw new Error("Failed to save students");
            return res.json();
         })
         .then((updated) => {
            toast.success("✅ All student details saved successfully!");
            setStudents(updated);
         })
         .catch((err) => {
            console.error("Error saving students:", err);
            toast.error("❌ Error saving students. Check backend logs.");
         });
   };

   return (
      <div className="manage-container">

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

         <div className="student">

            <Navbar onLogout={handleLogout} />

            {/* ✅ Tabs */}
            <div className="tabs">
               <button
                  className={`tab ${activeTab === "all" ? "active-tab" : ""}`}
                  onClick={() => setActiveTab("all")}
               >
                  Upload New
               </button>
               <button
                  className={`tab ${activeTab === "add" ? "active-tab" : ""}`}
                  onClick={() => setActiveTab("add")}
               >
                  Edit/Delete
               </button>
               <button
                  className={`tab ${activeTab === "settings" ? "active-tab" : ""}`}
                  onClick={() => setActiveTab("settings")}
               >
                  View
               </button>
            </div>

            <ToastContainer position="top-right" autoClose={3000} />

            {/* ✅ Tab Content */}
            {activeTab === "all" && (
               <>
                  {/* Upload Section */}
                  <div className="upload-section">
                     <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileUpload}
                     />
                  </div>

                  {/* ✅ Only show table after upload */}
                  {students.length > 0 && (
                     <>
                        <table className="students-table">
                           <thead>
                              <tr>
                                 <th>Sl No</th>
                                 <th>Name</th>
                                 <th>Email</th>
                                 <th>USN</th>
                                 <th>Division</th>
                                 <th style={{ textAlign: "center" }}>Delete</th>
                              </tr>
                           </thead>
                           <tbody>
                              {currentStudents.map((student, index) => (
                                 <tr key={student.id}>
                                    <td>{indexOfFirstRow + index + 1}</td>
                                    <td>{student.name}</td>
                                    <td>{student.email}</td>
                                    <td>{student.usn}</td>
                                    <td>{student.division}</td>
                                    <td style={{ textAlign: "center" }}>
                                       <button
                                          onClick={() => handleDelete(student)}
                                          className="delete-btn"
                                       >
                                          <FaTrash />
                                       </button>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="pagination">
                           <button
                              onClick={() => goToPage(currentPage - 1)}
                              disabled={currentPage === 1}
                           >
                              Prev
                           </button>
                           <span> Page {currentPage} of {totalPages} </span>
                           <button
                              onClick={() => goToPage(currentPage + 1)}
                              disabled={currentPage === totalPages}
                           >
                              Next
                           </button>
                        </div>

                        <button className="add-btn" onClick={handleSaveAll}>
                           Save Student Details
                        </button>
                     </>
                  )}
               </>
            )}

            {activeTab === "add" && (
               <>
                  <table className="students-table">
                     <thead>
                        <tr>
                           <th>Sl No</th>
                           <th>Name</th>
                           <th>Email</th>
                           <th>USN</th>
                           <th style={{ textAlign: "center" }}>Edit</th>
                           <th style={{ textAlign: "center" }}>Delete</th>
                        </tr>
                     </thead>
                     <tbody>
                        {currentStudents.length > 0 ? (
                           currentStudents.map((student, index) => (
                              <tr key={student.id}>
                                 <td>{indexOfFirstRow + index + 1}</td>
                                 <td>{student.name}</td>
                                 <td>{student.email}</td>
                                 <td>{student.usn}</td>
                                 <td style={{ textAlign: "center" }}>
                                    <button
                                       onClick={() => handleEdit(student)}
                                       className="edit-btn"
                                    >
                                       <FaEdit />
                                    </button>
                                 </td>
                                 <td style={{ textAlign: "center" }}>
                                    <button
                                       onClick={() => handleDelete(student)}
                                       className="delete-btn"
                                    >
                                       <FaTrash />
                                    </button>
                                 </td>
                              </tr>
                           ))
                        ) : (
                           <tr>
                              <td colSpan="6">No students found</td>
                           </tr>
                        )}
                     </tbody>
                  </table>

                  {/* Pagination */}
                  <div className="pagination">
                     <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                        Prev
                     </button>
                     <span> Page {currentPage} of {totalPages} </span>
                     <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                        Next
                     </button>
                  </div>

                  <button className="add-btn" onClick={handleSaveAll}>Save Student Details</button>
               </>
            )}

            {activeTab === "settings" && (
               <>
                  <table className="students-table">
                     <thead>
                        <tr>
                           <th>Sl No</th>
                           <th>Name</th>
                           <th>Email</th>
                           <th>USN</th>

                        </tr>
                     </thead>
                     <tbody>
                        {currentStudents.length > 0 ? (
                           currentStudents.map((student, index) => (
                              <tr key={student.id}>
                                 <td>{indexOfFirstRow + index + 1}</td>
                                 <td>{student.name}</td>
                                 <td>{student.email}</td>
                                 <td>{student.usn}</td>

                              </tr>
                           ))
                        ) : (
                           <tr>
                              <td colSpan="6">No students found</td>
                           </tr>
                        )}
                     </tbody>
                  </table>

                  {/* Pagination */}
                  <div className="pagination">
                     <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                        Prev
                     </button>
                     <span> Page {currentPage} of {totalPages} </span>
                     <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                        Next
                     </button>
                  </div>
               </>
            )}

            {/* Modal */}
            {isModalOpen && selectedStudent && (
               <div className="modal-overlay">
                  <div className="modal-content">
                     <h2>Edit Student</h2>
                     <label>Name:</label>
                     <input
                        type="text"
                        name="name"
                        value={selectedStudent.name}
                        onChange={handleInputChange}
                     />
                     <label>Email:</label>
                     <input
                        type="email"
                        name="email"
                        value={selectedStudent.email}
                        onChange={handleInputChange}
                     />
                     <label>USN:</label>
                     <input
                        type="text"
                        name="usn"
                        value={selectedStudent.usn}
                        onChange={handleInputChange}
                     />

                     {/* Gender */}
                     <label>Gender:</label>
                     <select
                        name="gender"
                        value={selectedStudent.gender || ""}
                        onChange={handleInputChange}
                     >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                     </select>

                     <div className="modal-actions">
                        <button onClick={handleSave} className="save-btn">Save</button>
                        <button
                           onClick={() => setIsModalOpen(false)}
                           className="cancel-btn"
                        >
                           Cancel
                        </button>
                     </div>
                  </div>
               </div>
            )}

            {/* Delete modal */}
            {isDeleteModalOpen && studentToDelete && (
               <div className="modal-overlay">
                  <div className="modal-content">
                     <h2>Confirm Delete</h2>
                     <p>
                        Are you sure you want to delete{" "}
                        <strong>{studentToDelete.name}</strong>?
                     </p>
                     <div className="modal-actions">
                        <button
                           onClick={confirmDelete}
                           className="delete-btn">
                           Yes, Delete
                        </button>
                        <button
                           onClick={() => setIsDeleteModalOpen(false)}
                           className="cancel-btn"
                        >
                           Cancel
                        </button>
                     </div>
                  </div>
               </div>
            )}

         </div>
      </div>
   );
}

export default ManageStudents;
