import React, { useEffect, useState } from "react";
import "./ManageStudents.css";
import { NavLink } from "react-router-dom";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ManageStudents() {
   const [students, setStudents] = useState([]);
   const [selectedStudent, setSelectedStudent] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const navigate = useNavigate();
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
   const [studentToDelete, setStudentToDelete] = useState(null);
   const [currentPage, setCurrentPage] = useState(1);
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

   const handleAdd = () => {
      setSelectedStudent({
         id: Date.now().toString(),
         name: "",
         email: "",
         usn: "",
         gender: ""   // ✅ default value
      });
      setIsModalOpen(true);
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

            <button className="add-btn" onClick={handleAdd}>Add New Student</button>

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
                              <button onClick={() => handleEdit(student)} className="edit-btn">
                                 <FaEdit />
                              </button>
                           </td>
                           <td style={{ textAlign: "center" }}>
                              <button onClick={() => handleDelete(student)} className="delete-btn">
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

            {/* ✅ Pagination outside the table */}
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

            <ToastContainer position="top-right" autoClose={3000} />

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
