import { useEffect, useState } from "react";
import "./ManageStudents"; // reuse same theme
import { NavLink } from "react-router-dom";
import Navbar from "../Refs/Navbar";
import SideBar from "../Refs/SideBar";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import ReactModal from "react-modal";

ReactModal.setAppElement("#root");

function ManageTeachers() {
   const [user, setUser] = useState(null);
   const [teachers, setTeachers] = useState([]);
   const navigate = useNavigate();
   const [currentPage, setCurrentPage] = useState(1);
   const rowsPerPage = 5;
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
   const [selectedTeacher, setSelectedTeacher] = useState(null);
   const [teacherToDelete, setTeacherToDelete] = useState(null);
   const [activeTab, setActiveTab] = useState("add"); // "add" = edit/delete, "view" = readonly
   const [courseOptions, setCourseOptions] = useState([{ courseName: 'hello', courseCode: '123' }]);

   // Pagination
   const indexOfLastRow = currentPage * rowsPerPage;
   const indexOfFirstRow = indexOfLastRow - rowsPerPage;
   const currentTeachers = teachers.slice(indexOfFirstRow, indexOfLastRow);
   const totalPages = Math.ceil(teachers.length / rowsPerPage);

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
      fetch("http://localhost:5000/api/teachers")
         .then((res) => res.json())
         .then((data) => setTeachers(data))
         .catch((err) => console.error("Error fetching teachers:", err));
   }, []);

   const handleEdit = (teacher) => {
      setSelectedTeacher({ ...teacher });
      setIsModalOpen(true);
   };

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setSelectedTeacher((prev) => ({ ...prev, [name]: value }));
   };
   const handleSelectCourse = (course) => {
      console.log("Selected Course:", course);
      const { courseName, courseCode } = course;
      setSelectedTeacher((prev) => ({ ...prev, courseName: courseName, courseCode: courseCode }));
   };

   const handleSave = () => {
      if (!selectedTeacher.courseCode || !selectedTeacher.courseName) {
         toast.error("❌ Course Code and Name are required");
         return;
      }

      // If editing existing course
      if (selectedTeacher.id) {
         setTeachers((prev) =>
            prev.map((c) =>
               c.id === selectedTeacher.id ? { ...selectedTeacher } : c
            )
         );
         toast.success("✅ Teacher updated locally");
      } else {
         // Adding new course
         const newCourse = {
            ...selectedTeacher,
            id: Date.now(), // temporary unique ID
         };
         setTeachers((prev) => [...prev, newCourse]);
         toast.success("✅ Teacher added locally");
      }

      setIsModalOpen(false);
      setSelectedTeacher(null);
   };

   const handleDelete = (teacher) => {
      setTeacherToDelete(teacher);
      setIsDeleteModalOpen(true);
   };

   const confirmDelete = () => {
      // Local delete only
      setTeachers((prev) => prev.filter((c) => c.id !== teacherToDelete.id));

      toast.success("✅ Course deleted locally");

      setIsDeleteModalOpen(false);
      setTeacherToDelete(null);
   };

   const handleBulkUpdate = () => {
      fetch(`http://localhost:5000/api/teachers/bulk-update`, {
         method: "PUT",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify(teachers), // send entire teachers state
      })
         .then((res) => {
            if (!res.ok) throw new Error("Bulk update failed");
            return res.json();
         })
         .then((data) => {
            toast.success(`✅ ${data.count} teachers updated in DB`);
         })
         .catch((err) => {
            console.error("Error in bulk update:", err);
            toast.error("❌ Error updating teachers");
         });
   };

   return (
      <div className="manage-container">
         <SideBar />

         <div className="student">
            <Navbar title="Manage Teachers" user={user} onLogout={handleLogout} />

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
                        setSelectedTeacher(null);
                        setIsModalOpen(true);
                     }}
                  >
                     <FaPlus style={{ marginRight: "6px" }} />
                     Add Teacher
                  </button>

                  <table className="students-table">
                     <thead>
                        <tr>
                           <th>Sl No</th>
                           <th>Teacher Name</th>
                           <th>Course Code</th>
                           <th>Course Name</th>
                           <th>Credits</th>
                           <th>Department</th>
                           <th>Status</th>
                           <th>Edit</th>
                           <th>Delete</th>
                        </tr>
                     </thead>
                     <tbody>
                        {currentTeachers.map((teacher, index) => (
                           <tr key={teacher.id}>
                              <td>{indexOfFirstRow + index + 1}</td>
                              <td>{teacher.courseName}</td>
                              <td>{teacher.courseCode}</td>
                              <td>{teacher.courseName}</td>
                              <td>{teacher.credits}</td>
                              <td>{teacher.department}</td>
                              <td>{teacher.status}</td>
                              <td>
                                 <button
                                    onClick={() => handleEdit(teacher)}
                                    className="edit-btn"
                                 >
                                    <FaEdit />
                                 </button>
                              </td>
                              <td>
                                 <button
                                    onClick={() => handleDelete(teacher)}
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

                  <button className="add-btn" onClick={handleBulkUpdate}>Save Teacher Details</button>
               </>
            )}

            {activeTab === "view" && (
               <table className="students-table">
                  <thead>
                     <tr>
                        <th>Sl No</th>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>Department</th>
                        <th>Semester</th>
                     </tr>
                  </thead>
                  <tbody>
                     {currentTeachers.map((teacher, index) => (
                        <tr key={teacher.id}>
                           <td>{indexOfFirstRow + index + 1}</td>
                           <td>{teacher.courseCode}</td>
                           <td>{teacher.courseName}</td>
                           <td>{teacher.department}</td>
                           <td>{teacher.semester}</td>
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

               <h2 htmlFor="course">{selectedTeacher?.id ? "Edit Teacher" : "Add Teacher"}</h2>
               <div className="form-field">
                  <label htmlFor="teacherName">Teacher Name</label>
                  <input
                     id="teacherName"
                     type="text"
                     name="teacherName"
                     value={selectedTeacher?.teacherName || ""}
                     onChange={handleInputChange}
                  />
               </div>
               <div className="form-grid">

                  <div className="form-field">
                     <label htmlFor="courseName">Course Name</label>
                     <select
                        id="courseName"
                        name="courseName"
                        value={selectedTeacher?.courseName || ""}
                        onChange={(e) => {
                           const selected = courseOptions.find(course => course.courseName === e.target.value);
                           console.log("seelected", selected, e.target.value)
                           handleSelectCourse(selected);
                        }}
                     >
                        <option value="">Select</option>
                        {courseOptions.map((course) => (
                           <option key={course.courseName} value={course.courseName}>
                              {course.courseName}
                           </option>
                        ))}
                     </select>
                  </div>


                  <div className="form-field">
                     <label htmlFor="courseCode">Course Code</label>
                     <input
                        id="courseCode"
                        type="text"
                        name="courseCode"
                        disabled={true}
                        value={selectedTeacher?.courseCode || ""}
                        placeholder="Select Course Name"
                        style={{ background: '#ccc' }}
                     // onChange={handleInputChange}
                     />
                  </div>


                  <div className="form-field">
                     <label htmlFor="email">Email</label>
                     <input
                        id="email"
                        type="text"
                        name="email"
                        value={selectedTeacher?.email || ""}
                        onChange={handleInputChange}
                     />
                  </div>
                  <div className="form-field">
                     <label htmlFor="department">Department</label>
                     <input
                        id="department"
                        type="text"
                        name="department"
                        value={selectedTeacher?.department || ""}
                        onChange={handleInputChange}
                     />
                  </div>




                  <div className="form-field">
                     <label htmlFor="status">Status</label>
                     <select
                        id="status"
                        name="status"
                        value={selectedTeacher?.status || "Active"}
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
                  <strong>{teacherToDelete?.courseName}</strong>?
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

export default ManageTeachers;