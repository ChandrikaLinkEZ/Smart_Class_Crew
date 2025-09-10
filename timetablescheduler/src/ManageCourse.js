import { useEffect, useState } from "react";
import "./ManageCourse.css"; // reuse same theme
import { NavLink } from "react-router-dom";
import Navbar from "./Navbar";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import ReactModal from "react-modal";

ReactModal.setAppElement("#root");

function ManageCourses() {
   const [user, setUser] = useState(null);
   const [courses, setCourses] = useState([]);
   const navigate = useNavigate();
   const [currentPage, setCurrentPage] = useState(1);
   const rowsPerPage = 5;
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
   const [selectedCourse, setSelectedCourse] = useState(null);
   const [courseToDelete, setCourseToDelete] = useState(null);
   const [activeTab, setActiveTab] = useState("add"); // "add" = edit/delete, "view" = readonly

   // Pagination
   const indexOfLastRow = currentPage * rowsPerPage;
   const indexOfFirstRow = indexOfLastRow - rowsPerPage;
   const currentCourses = courses.slice(indexOfFirstRow, indexOfLastRow);
   const totalPages = Math.ceil(courses.length / rowsPerPage);

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
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
         setUser(JSON.parse(storedUser));
      }
   }, []);

   useEffect(() => {
      fetch("http://localhost:5000/api/courses")
         .then((res) => res.json())
         .then((data) => setCourses(data))
         .catch((err) => console.error("Error fetching courses:", err));
   }, []);

   const handleEdit = (course) => {
      setSelectedCourse({ ...course });
      setIsModalOpen(true);
   };

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setSelectedCourse((prev) => ({ ...prev, [name]: value }));
   };

   const handleSave = () => {
      if (!selectedCourse.courseCode || !selectedCourse.courseName) {
         toast.error("❌ Course Code and Name are required");
         return;
      }

      // If editing existing course
      if (selectedCourse.id) {
         setCourses((prev) =>
            prev.map((c) =>
               c.id === selectedCourse.id ? { ...selectedCourse } : c
            )
         );
         toast.success("✅ Course updated locally");
      } else {
         // Adding new course
         const newCourse = {
            ...selectedCourse,
            id: Date.now(), // temporary unique ID
         };
         setCourses((prev) => [...prev, newCourse]);
         toast.success("✅ Course added locally");
      }

      setIsModalOpen(false);
      setSelectedCourse(null);
   };

   const handleDelete = (course) => {
      setCourseToDelete(course);
      setIsDeleteModalOpen(true);
   };

   const confirmDelete = () => {
      // Local delete only
      setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));

      toast.success("✅ Course deleted locally");

      setIsDeleteModalOpen(false);
      setCourseToDelete(null);
   };

   const handleBulkUpdate = () => {
      fetch(`http://localhost:5000/api/courses/bulk-update`, {
         method: "PUT",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify(courses), // send entire courses state
      })
         .then((res) => {
            if (!res.ok) throw new Error("Bulk update failed");
            return res.json();
         })
         .then((data) => {
            toast.success(`✅ ${data.count} courses updated in DB`);
         })
         .catch((err) => {
            console.error("Error in bulk update:", err);
            toast.error("❌ Error updating courses");
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
                  <NavLink to="/students" className={({ isActive }) => (isActive ? "active" : "")}>
                     Manage Students
                  </NavLink>
               </li>
               <li>
                  <NavLink to="/courses" className={({ isActive }) => (isActive ? "active" : "")}>
                     Manage Courses
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
            <Navbar title="Manage Courses" user={user} onLogout={handleLogout} />

            {/* Tabs */}
            <div className="tabs">
               <button
                  className={`tab ${activeTab === "add" ? "active-tab" : ""}`}
                  onClick={() => setActiveTab("add")}
               >
                  Edit/Delete
               </button>
               <button
                  className={`tab ${activeTab === "view" ? "active-tab" : ""}`}
                  onClick={() => setActiveTab("view")}
               >
                  View
               </button>
            </div>

            <ToastContainer position="top-right" autoClose={3000} />

            {activeTab === "add" && (
               <>
                  <button
                     className="add-btn"
                     onClick={() => {
                        setSelectedCourse({});
                        setIsModalOpen(true);
                     }}
                  >
                     <FaPlus style={{ marginRight: "6px" }} />
                     Add Course
                  </button>

                  <table className="students-table">
                     <thead>
                        <tr>
                           <th>Sl No</th>
                           <th>Course Code</th>
                           <th>Course Name</th>
                           <th>Credits</th>
                           <th>Department</th>
                           <th>Semester</th>
                           <th>Type</th>
                           <th>Status</th>
                           <th>Edit</th>
                           <th>Delete</th>
                        </tr>
                     </thead>
                     <tbody>
                        {currentCourses.map((course, index) => (
                           <tr key={course.id}>
                              <td>{indexOfFirstRow + index + 1}</td>
                              <td>{course.courseCode}</td>
                              <td>{course.courseName}</td>
                              <td>{course.credits}</td>
                              <td>{course.department}</td>
                              <td>{course.semester}</td>
                              <td>{course.type}</td>
                              <td>{course.status}</td>
                              <td>
                                 <button
                                    onClick={() => handleEdit(course)}
                                    className="edit-btn"
                                 >
                                    <FaEdit />
                                 </button>
                              </td>
                              <td>
                                 <button
                                    onClick={() => handleDelete(course)}
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
                     <span>
                        Page {currentPage} of {totalPages}
                     </span>
                     <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                     >
                        Next
                     </button>
                  </div>

                  <button className="add-btn" onClick={handleBulkUpdate}>Save Course Details</button>
               </>
            )}

            {activeTab === "view" && (
               <table className="students-table">
                  <thead>
                     <tr>
                        <th>Sl No</th>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>Credits</th>
                        <th>Department</th>
                        <th>Semester</th>
                     </tr>
                  </thead>
                  <tbody>
                     {currentCourses.map((course, index) => (
                        <tr key={course.id}>
                           <td>{indexOfFirstRow + index + 1}</td>
                           <td>{course.courseCode}</td>
                           <td>{course.courseName}</td>
                           <td>{course.credits}</td>
                           <td>{course.department}</td>
                           <td>{course.semester}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            )}

            {/* Modal */}
            <ReactModal
               isOpen={isModalOpen}
               onRequestClose={() => setIsModalOpen(false)}
               className="modal-content"
               overlayClassName="modal-overlay"
            >

               <h2 htmlFor="course">{selectedCourse?.id ? "Edit Course" : "Add Course"}</h2>
               <div className="form-grid">
                  <div className="form-field">
                     <label htmlFor="courseCode">Course Code</label>
                     <input
                        id="courseCode"
                        type="text"
                        name="courseCode"
                        value={selectedCourse?.courseCode || ""}
                        onChange={handleInputChange}
                     />
                  </div>

                  <div className="form-field">
                     <label htmlFor="courseName">Course Name</label>
                     <input
                        id="courseName"
                        type="text"
                        name="courseName"
                        value={selectedCourse?.courseName || ""}
                        onChange={handleInputChange}
                     />
                  </div>

                  <div className="form-field">
                     <label htmlFor="credits">Credits</label>
                     <input
                        id="credits"
                        type="number"
                        name="credits"
                        value={selectedCourse?.credits || ""}
                        onChange={handleInputChange}
                     />
                  </div>

                  <div className="form-field">
                     <label htmlFor="department">Department</label>
                     <input
                        id="department"
                        type="text"
                        name="department"
                        value={selectedCourse?.department || ""}
                        onChange={handleInputChange}
                     />
                  </div>

                  <div className="form-field">
                     <label htmlFor="semester">Semester</label>
                     <input
                        id="semester"
                        type="number"
                        name="semester"
                        value={selectedCourse?.semester || ""}
                        onChange={handleInputChange}
                     />
                  </div>

                  <div className="form-field">
                     <label htmlFor="type">Type</label>
                     <select
                        id="type"
                        name="type"
                        value={selectedCourse?.type || ""}
                        onChange={handleInputChange}
                     >
                        <option value="">Select</option>
                        <option value="Core">Core</option>
                        <option value="Elective">Elective</option>
                     </select>
                  </div>

                  <div className="form-field">
                     <label htmlFor="status">Status</label>
                     <select
                        id="status"
                        name="status"
                        value={selectedCourse?.status || "Active"}
                        onChange={handleInputChange}
                     >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                     </select>
                  </div>
               </div>

               <div className="modal-actions">
                  <button onClick={handleSave} className="save-btn">Save</button>
                  <button onClick={() => setIsModalOpen(false)} className="cancel-btn">
                     Cancel
                  </button>
               </div>
            </ReactModal>

            {/* Delete Modal */}
            <ReactModal
               isOpen={isDeleteModalOpen}
               onRequestClose={() => setIsDeleteModalOpen(false)}
               className="modal-content"
               overlayClassName="modal-overlay"
            >
               <h2>Confirm Delete</h2>
               <p>
                  Are you sure you want to delete{" "}
                  <strong>{courseToDelete?.courseName}</strong>?
               </p>
               <div className="modal-actions">
                  <button onClick={confirmDelete} className="delete-btn">
                     Yes, Delete
                  </button>
                  <button
                     onClick={() => setIsDeleteModalOpen(false)}
                     className="cancel-btn"
                  >
                     Cancel
                  </button>
               </div>
            </ReactModal>
         </div>
      </div>
   );
}

export default ManageCourses;
