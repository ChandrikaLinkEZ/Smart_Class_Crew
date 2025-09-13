import { useEffect, useRef, useState } from "react";
import "./ManageCourse.css"; // reuse same theme
import Navbar from "../Refs/Navbar";
import SideBar from "../Refs/SideBar";
import { FaEdit, FaTrash, FaUpload } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import ReactModal from "react-modal";
import Select from "react-select";
import * as XLSX from "xlsx";

ReactModal.setAppElement("#root");

function ManageCourses() {
   const [user, setUser] = useState(null);
   const [courses, setCourses] = useState([]);
   const [teachers, setTeachers] = useState([]);
   const fileInputRef = useRef(null);
   const [uploadedCourses, setUploadedCourses] = useState([]);
   const [selectedUploads, setSelectedUploads] = useState([]);
   const [isValidated, setIsValidated] = useState(false);
   const navigate = useNavigate();
   const [currentPage, setCurrentPage] = useState(1);
   const rowsPerPage = 5;
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
   const [selectedCourse, setSelectedCourse] = useState(null);
   const [courseToDelete, setCourseToDelete] = useState(null);
   const [activeTab, setActiveTab] = useState("all"); // "add" = edit/delete, "view" = readonly

   // ✅ Pagination for Upload Courses
   const [currentPageUpload, setCurrentPageUpload] = useState(1);
   const rowsPerPageUpload = 5;
   const indexOfLastUpload = currentPageUpload * rowsPerPageUpload;
   const indexOfFirstUpload = indexOfLastUpload - rowsPerPageUpload;
   const currentUploadedCourses = uploadedCourses.slice(
      indexOfFirstUpload,
      indexOfLastUpload
   );
   const totalPagesUpload = Math.ceil(uploadedCourses.length / rowsPerPageUpload);

   // Pagination
   const indexOfLastRow = currentPage * rowsPerPage;
   const indexOfFirstRow = indexOfLastRow - rowsPerPage;
   const currentCourses = courses.length > 0 ? courses.slice(indexOfFirstRow, indexOfLastRow) : [];
   const totalPages = courses.length > 0 ? Math.ceil(courses.length / rowsPerPage) : 1;

   const [toggleSelectAll, setToggleSelectAll] = useState();

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
         .then((data) => {
            const formatted = data.map((t) => ({
               value: t.id,
               label: t.name
            }));
            setTeachers(formatted);
         })
         .catch((err) => console.error("Error fetching teachers:", err));
   }, []);

   useEffect(() => {
      fetch("http://localhost:5000/api/courses")
         .then((res) => res.json())
         .then((data) => {
            setCourses(data)
            // setSelectedTeachers(data.map())
            // setteachers(data.map )
         })
         .catch((err) => console.error("Error fetching courses:", err));
   }, []);

   const handleEdit = (course) => {
      setSelectedCourse({ ...course });
      setIsModalOpen(true);
   };

   const toggleRowSelection = (id) => {
      setSelectedUploads((prev) =>
         prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
      );
   };

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setSelectedCourse((prev) => ({ ...prev, [name]: value }));
   };

   const handleClick = () => {
      fileInputRef.current.click();
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

         const newCourses = rows.map((row, index) => ({
            id: Date.now().toString() + index,
            coursecode: row.courseCode || row.coursecode || "",
            coursename: row.courseName || row.coursename || "",
            teachers: row.Teachers || row.teachers || "",
            credits: row.Credits || row.credits || "",
            department: row.Department || row.department || "",
            semester: row.Semester || row.semester || "",
            type: row.Type || row.type || ""
         }));

         setUploadedCourses(newCourses);
         setCurrentPageUpload(1);
      };
      reader.readAsArrayBuffer(file);
   };

   // ✅ Delete selected
   const handleDeleteSelected = () => {
      setUploadedCourses((prev) =>
         prev.filter((course) => !selectedUploads.includes(course.id))
      );
      setSelectedUploads([]);
      toast.success("✅ Selected rows deleted");
   };

   // Validation + Commit
   const handleValidate = async () => {
      if (uploadedCourses.length === 0) {
         toast.error("❌ No data to validate.");
         return;
      }
      fetch("http://localhost:5000/api/courses/validate", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(uploadedCourses), // must be array of course objects
      })
         .then((res) => {
            if (!res.ok) throw new Error("Validation failed");
            return res.json();
         })
         .then((validatedData) => {
            setUploadedCourses(validatedData);
            toast.success("✅ Validation complete. Check the Status column.");
            setIsValidated(validatedData.every(course => course.status === "Valid"));
         })

         .catch((err) => {
            console.error("Validation error:", err);
            toast.error("❌ Error validating data. Check backend.");
         });
   };

   const handleCommit = (dataToSave) => {
      fetch("http://localhost:5000/api/courses/commitData", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(dataToSave),
      })
         .then((res) => {
            if (!res.ok) throw new Error("Failed to commit courses");
            return res.json();
         })
         .then((result) => {
            toast.success(`✅ ${result.inserted} courses committed, ${result.skipped} skipped!`);
            fetch("http://localhost:5000/api/courses")
               .then((res) => res.json())
               .then((data) => setCourses(data));
            setUploadedCourses([]);
            setIsValidated(false);
         })
         .catch((err) => {
            console.error("Error committing courses:", err);
            toast.error("❌ Error committing courses.");
         });
   };

   const handleSave = () => {
      if (!selectedCourse.coursecode || !selectedCourse.coursename) {
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
         <SideBar />

         <div className="student">
            <Navbar title="Manage Courses" user={user} onLogout={handleLogout} />

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

            {/* ✅ Upload New Tab */}
            {activeTab === "all" && (
               <>
                  <div className="upload-btn-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                     <div>
                        <input type="file" accept=".xlsx, .xls" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileUpload} />
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
                                    selectedUploads.length === currentUploadedCourses.length
                                 }
                                 style={{ accentColor: "#fff", transform: "scale(1.2)" }}
                              />
                           </th>
                           <th>Sl No</th>
                           <th>Course Name</th>
                           <th>Course Code</th>
                           <th>Teachers</th>
                           <th>Credits</th>
                           <th>Department</th>
                           <th>Semester</th>
                           <th>Type</th>
                           <th>Status</th>
                           <th style={{ textAlign: "center" }}>Delete</th>
                        </tr>
                     </thead>
                     <tbody>
                        {currentUploadedCourses.map((course, index) => (
                           <tr key={course.id}>
                              <td>
                                 <input
                                    type="checkbox"
                                    checked={selectedUploads.includes(course.id)}
                                    onChange={() => toggleRowSelection(course.id)}
                                    style={{ transform: "scale(1.2)" }}
                                 />
                              </td>
                              <td>{indexOfFirstUpload + index + 1}</td>
                              <td>{course.coursename}</td>
                              <td>{course.coursecode}</td>
                              <td>{course.teachers}</td>
                              <td>{course.credits}</td>
                              <td>{course.department}</td>
                              <td>{course.semester}</td>
                              <td>{course.type}</td>
                              <td className={`status-cell ${course.status === "Valid" ? "status-success" : "status-error"}`}>
                                 {course.status}
                              </td>
                              <td style={{ textAlign: "center" }}>
                                 <button
                                    onClick={() => setUploadedCourses(prev => prev.filter(course => course.id !== course.id))}
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
                           uploadedCourses.length <= rowsPerPageUpload ||
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
                           uploadedCourses.length <= rowsPerPageUpload ||
                           currentPageUpload === totalPagesUpload
                        }
                     >
                        Next
                     </button>
                  </div>


                  <div className="belowButton">
                     <button className="add-btn" onClick={handleValidate} disabled={uploadedCourses.length === 0 || isValidated}>Validate</button>
                     <button className={`add-btn ${!isValidated ? "disabled-btn" : ""}`} onClick={() => handleCommit(uploadedCourses)} disabled={!isValidated}>
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
                        setSelectedCourse({});
                        setIsModalOpen(true);
                     }}
                  >
                     <FaPlus style={{ marginRight: "6px" }} />
                     Add Course
                  </button> */}

                  <table className="students-table">
                     <thead>
                        <tr>
                           <th>Sl No</th>
                           <th>Course Name</th>
                           <th>Course Code</th>
                           <th>Teachers</th>
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
                              <td>{course.coursename}</td>
                              <td>{course.coursecode}</td>
                              <td>{course.teachers}</td>
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
                        <th>Course Name</th>
                        <th>Course Code</th>
                        <th>Teachers</th>
                        <th>Credits</th>
                        <th>Department</th>
                        <th>Semester</th>
                        <th>Type</th>
                     </tr>
                  </thead>
                  <tbody>
                     {currentCourses.map((course, index) => (
                        <tr key={course.id}>
                           <td>{indexOfFirstRow + index + 1}</td>
                           <td>{course.coursename}</td>
                           <td>{course.coursecode}</td>
                           <td>{course.teachers}</td>
                           <td>{course.credits}</td>
                           <td>{course.department}</td>
                           <td>{course.semester}</td>
                           <td>{course.type}</td>
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
                     <label htmlFor="coursecode">Course Code</label>
                     <input
                        id="coursecode"
                        type="text"
                        name="coursecode"
                        value={selectedCourse?.coursecode || ""}
                        onChange={handleInputChange}
                     />
                  </div>

                  <div className="form-field">
                     <label htmlFor="coursename">Course Name</label>
                     <input
                        id="coursename"
                        type="text"
                        name="coursename"
                        value={selectedCourse?.coursename || ""}
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
                        <option value="" disabled>Select</option>
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

                  <div className="form-field">
                     <label htmlFor="teachers">Assign Teachers</label>

                     <Select
                        id="teachers"
                        isMulti
                        options={teachers}   // must be array of { value, label }
                        value={
                           selectedCourse?.teachers
                              ? teachers.filter((option) => selectedCourse.teachers.includes(option.label))
                              : []
                        }
                        onChange={(selected) => {
                           const selectedNames = selected ? selected.map((s) => s.label) : [];
                           setSelectedCourse((prev) => ({ ...prev, teachers: selectedNames }));
                           console.log("selected teachers : ", selectedNames);
                        }}
                        placeholder="Select teachers"
                     />
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
                  <strong>{courseToDelete?.coursename}</strong>?
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