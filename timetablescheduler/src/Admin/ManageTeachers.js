import { useEffect, useState, useRef } from "react";
import "./ManageStudents"; // reuse same theme
import Navbar from "../Refs/Navbar";
import SideBar from "../Refs/SideBar";
import { FaEdit, FaTrash, FaUpload } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import ReactModal from "react-modal";
import * as XLSX from "xlsx";

ReactModal.setAppElement("#root");

function ManageTeachers() {
   const [user, setUser] = useState(null);
   const fileInputRef = useRef(null);
   const [uploadedTeachers, setUploadedTeachers] = useState([]);
   const [selectedUploads, setSelectedUploads] = useState([]);
   const [teachers, setTeachers] = useState([]);
   const navigate = useNavigate();
   const [isValidated, setIsValidated] = useState(false);
   const [currentPage, setCurrentPage] = useState(1);
   const rowsPerPage = 5;
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
   const [selectedTeacher, setSelectedTeacher] = useState(null);
   const [teacherToDelete, setTeacherToDelete] = useState(null);
   const [activeTab, setActiveTab] = useState("all"); // "all" = Upload New, "add" = edit/delete, "view" = readonly
   const [courseOptions, setCourseOptions] = useState([]);

   // Pagination

   // ✅ Pagination for Upload Students
   const [currentPageUpload, setCurrentPageUpload] = useState(1);
   const rowsPerPageUpload = 5;
   const indexOfLastUpload = currentPageUpload * rowsPerPageUpload;
   const indexOfFirstUpload = indexOfLastUpload - rowsPerPageUpload;
   const currentUploadedStudents = uploadedTeachers.slice(
      indexOfFirstUpload,
      indexOfLastUpload
   );
   const totalPagesUpload = Math.ceil(uploadedTeachers.length / rowsPerPageUpload);


   const indexOfLastRow = currentPage * rowsPerPage;
   const indexOfFirstRow = indexOfLastRow - rowsPerPage;
   const currentTeachers = teachers.length > 0 ? teachers.slice(indexOfFirstRow, indexOfLastRow) : [];
   const totalPages = teachers.length > 0 ? Math.ceil(teachers.length / rowsPerPage) : 1;

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
         .then((data) => setCourseOptions(data))
         .catch((err) => console.error("Error fetching courses:", err));
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

   const handleSave = () => {
      if (!selectedTeacher.coursename) {
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

   // ✅ Toggle single row
   const toggleRowSelection = (id) => {
      setSelectedUploads((prev) =>
         prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
      );
   };

   // ✅ Toggle all rows
   const toggleSelectAll = () => {
      if (selectedUploads.length === currentUploadedStudents.length) {
         setSelectedUploads([]);
      } else {
         setSelectedUploads(currentUploadedStudents.map((t) => t.id));
      }
   };

   // ✅ Delete selected
   const handleDeleteSelected = () => {
      setUploadedTeachers((prev) =>
         prev.filter((teacher) => !selectedUploads.includes(teacher.id))
      );
      setSelectedUploads([]);
      toast.success("✅ Selected rows deleted");
   };

   const handleSelectCourse = (course) => {
      if (!course) return;
      setSelectedTeacher((prev) => ({
         ...prev,
         coursename: course.courseName,
         coursecode: course.courseCode
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

         const newTeachers = rows.map((row, index) => ({
            id: Date.now().toString() + index,
            name: row.Name || row.name || "",
            abv: row.ABV || row.abv || "",
            email: row.Email || row.email || "",
            coursename: row.courseName || row.coursename || ""
         }));

         setUploadedTeachers(newTeachers);
         setCurrentPageUpload(1);
         setSelectedUploads([]);
      };
      reader.readAsArrayBuffer(file);
   };

   const handleClick = () => {
      fileInputRef.current.click();
   };

   const handleValidate = () => {
      if (uploadedTeachers.length === 0) {
         toast.error("❌ No data to validate.");
         return;
      }

      fetch("http://localhost:5000/api/teachers/validate", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(uploadedTeachers),
      })
         .then((res) => {
            if (!res.ok) throw new Error("Validation failed");
            return res.json();
         })
         .then((validatedData) => {
            setUploadedTeachers(validatedData);
            toast.success("✅ Validation complete. Check the Status column.");
            setIsValidated(validatedData.every(stu => stu.status === "Valid"));
         })
         .catch((err) => {
            console.error("Validation error:", err);
            toast.error("❌ Error validating data. Check backend.");
         });
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

   const handleCommit = (dataToSave) => {
      fetch("http://localhost:5000/api/teachers/commitData", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(dataToSave),
      })
         .then((res) => {
            if (!res.ok) throw new Error("Failed to commit teachers");
            return res.json();
         })
         .then((result) => {
            toast.success(`✅ ${result.inserted} teachers committed, ${result.skipped} skipped!`);
            fetch("http://localhost:5000/api/teachers")
               .then((res) => res.json())
               .then((data) => setTeachers(data));
            setUploadedTeachers([]);
            setIsValidated(false);
         })
         .catch((err) => {
            console.error("Error committing teachers:", err);
            toast.error("❌ Error committing teachers.");
         });
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
                  className={`tab ${activeTab === "view" ? "active-tab" : ""}`}
                  onClick={() => setActiveTab("view")}
               >
                  View
               </button>
            </div>

            <ToastContainer position="top-right" autoClose={3000} />

            {activeTab === "all" && (
               <>
                  <div className="upload-btn-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                     <div>
                        <input
                           type="file"
                           accept=".xlsx, .xls"
                           ref={fileInputRef}
                           style={{ display: "none" }}
                           onChange={handleFileUpload}
                        />
                        <button className="upload-btn" onClick={handleClick}>
                           <FaUpload style={{ marginRight: "8px" }} /> Click to Upload
                        </button>
                     </div>

                     <div>
                        <button
                           className="delete-btn"
                           onClick={handleDeleteSelected}
                           disabled={selectedUploads.length === 0}
                        >
                           Delete Selected
                        </button>
                     </div>
                  </div>

                  <table className="students-table">
                     <thead>
                        <tr>
                           <th>
                              <input
                                 type="checkbox"
                                 onChange={toggleSelectAll}
                                 checked={
                                    selectedUploads.length > 0 &&
                                    selectedUploads.length === currentUploadedStudents.length
                                 }
                                 style={{ accentColor: "#fff", transform: "scale(1.2)" }}
                              />
                           </th>
                           <th>Sl No</th>
                           <th>Teacher Name</th>
                           <th>Alias</th>
                           <th>Email</th>
                           <th>Course Name</th>
                           <th>Status</th>
                           <th style={{ textAlign: "center" }}>Delete</th>
                        </tr>
                     </thead>
                     <tbody>
                        {currentUploadedStudents.map((teacher, index) => (
                           <tr key={teacher.id}>
                              <td>
                                 <input
                                    type="checkbox"
                                    checked={selectedUploads.includes(teacher.id)}
                                    onChange={() => toggleRowSelection(teacher.id)}
                                    style={{ transform: "scale(1.2)" }}
                                 />
                              </td>
                              <td>{indexOfFirstUpload + index + 1}</td>
                              <td>{teacher.name}</td>
                              <td>{teacher.abv}</td>
                              <td>{teacher.email}</td>
                              <td>{teacher.coursename}</td>
                              <td className={`status-cell ${teacher.status === "Valid" ? "status-success" : "status-error"}`}>
                                 {teacher.status}
                              </td>
                              <td style={{ textAlign: "center" }}>
                                 <button
                                    onClick={() => setUploadedTeachers(prev => prev.filter(stu => stu.id !== teacher.id))}
                                    className="delete-btn"
                                 >
                                    <FaTrash />
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>

                  {/* Pagination Upload */}
                  <div className="pagination">
                     <button
                        onClick={() => setCurrentPageUpload(currentPageUpload - 1)}
                        disabled={
                           uploadedTeachers.length <= rowsPerPageUpload ||
                           currentPageUpload === 1
                        }
                     >
                        Prev
                     </button>
                     <span>
                        Page {currentPageUpload} of {totalPagesUpload || 1}
                     </span>
                     <button
                        onClick={() => setCurrentPageUpload(currentPageUpload + 1)}
                        disabled={
                           uploadedTeachers.length <= rowsPerPageUpload ||
                           currentPageUpload === totalPagesUpload
                        }
                     >
                        Next
                     </button>
                  </div>


                  <div className="belowButton">
                     <button className="add-btn" onClick={handleValidate} disabled={uploadedTeachers.length === 0}>Validate</button>
                     <button className={`add-btn ${!isValidated ? "disabled-btn" : ""}`} onClick={() => handleCommit(uploadedTeachers)} disabled={!isValidated}>
                        Commit
                     </button>
                  </div>
               </>
            )}

            {activeTab === "add" && (
               <>
                  {/* <button
                     className="add-btn"
                     onClick={() => {
                        setSelectedTeacher(null);
                        setIsModalOpen(true);
                     }}
                  >
                     <FaPlus style={{ marginRight: "6px" }} />
                     Add Teacher
                  </button> */}

                  <table className="students-table">
                     <thead>
                        <tr>
                           <th>Sl No</th>
                           <th>Teacher Name</th>
                           <th>Alias</th>
                           <th>Email</th>
                           <th>Course Name</th>
                           <th>Status</th>
                           <th>Edit</th>
                           <th>Delete</th>
                        </tr>
                     </thead>
                     <tbody>
                        {currentTeachers.map((teacher, index) => (
                           <tr key={teacher.id}>
                              <td>{indexOfFirstRow + index + 1}</td>
                              <td>{teacher.name}</td>
                              <td>{teacher.abv}</td>
                              <td>{teacher.email}</td>
                              <td>{teacher.coursename}</td>
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
                        <th>Teacher Name</th>
                        <th>Alias</th>
                        <th>Email</th>
                        <th>Course Name</th>
                        <th>Status</th>
                     </tr>
                  </thead>
                  <tbody>
                     {currentTeachers.map((teacher, index) => (
                        <tr key={teacher.id}>
                           <td>{indexOfFirstRow + index + 1}</td>
                           <td>{teacher.name}</td>
                           <td>{teacher.abv}</td>
                           <td>{teacher.email}</td>
                           <td>{teacher.coursename}</td>
                           <td>{teacher.status}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            )}

            {/* Edit Modal */}
            <ReactModal
               isOpen={isModalOpen}
               onRequestClose={() => setIsModalOpen(false)}
               className="modal-content"
               overlayClassName="modal-overlay"
            >

               <h2 htmlFor="course">{selectedTeacher?.id ? "Edit Teacher" : "Add Teacher"}</h2>
               {/* faculty name */}
               <div className="form-field">
                  <label htmlFor="teacherName">Teacher Name</label>
                  <input
                     id="teacherName"
                     type="text"
                     name="teacherName"
                     value={selectedTeacher?.name || ""}
                     onChange={handleInputChange}
                  />
               </div>

               <div className="form-grid">

                  {/* abbreviation of the faculty name */}
                  <div className="form-field">
                     <label htmlFor="alias">Alias</label>
                     <input
                        id="alias"
                        type="text"
                        name="abv"
                        value={selectedTeacher?.abv || ""}
                        onChange={handleInputChange}
                     />
                  </div>

                  {/* course name */}
                  <div className="form-field">
                     <label htmlFor="courseName">Course Name</label>
                     <select
                        id="courseName"
                        name="coursename"
                        value={selectedTeacher?.coursename || ""}  // ✅ match the state key
                        onChange={(e) => {
                           const selected = courseOptions.find(course => course.courseName === e.target.value);
                           handleSelectCourse(selected);
                        }}
                     >
                        <option value="" disabled>Select</option>
                        {courseOptions.map((course) => (
                           <option key={course.coursecode} value={course.courseName}>
                              {course.courseName}
                           </option>
                        ))}
                     </select>
                  </div>

                  {/* <div className="form-field">
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
                  </div> */}

                  {/* faculty email */}
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

                  {/* <div className="form-field">
                     <label htmlFor="department">Department</label>
                     <input
                        id="department"
                        type="text"
                        name="department"
                        value={selectedTeacher?.department || ""}
                        onChange={handleInputChange}
                     />
                  </div> */}




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