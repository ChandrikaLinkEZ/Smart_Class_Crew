import { useEffect, useState, useRef } from "react";
import "./ManageStudents.css";
import Navbar from "../Refs/Navbar";
import SideBar from "../Refs/SideBar";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaUpload } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";

function ManageStudents() {
   const [user, setUser] = useState(null);
   const [students, setStudents] = useState([]);
   const [uploadedStudents, setUploadedStudents] = useState([]);
   const [selectedStudent, setSelectedStudent] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
   const [studentToDelete, setStudentToDelete] = useState(null);
   const [activeTab, setActiveTab] = useState("all");
   const [isValidated, setIsValidated] = useState(false);
   const fileInputRef = useRef(null);
   const navigate = useNavigate();

   // ✅ Pagination for All Students (Edit/Delete + View)
   const [currentPageAll, setCurrentPageAll] = useState(1);
   const rowsPerPageAll = 5;
   const indexOfLastRowAll = currentPageAll * rowsPerPageAll;
   const indexOfFirstRowAll = indexOfLastRowAll - rowsPerPageAll;
   const currentStudents = students.slice(indexOfFirstRowAll, indexOfLastRowAll);
   const totalPagesAll = Math.ceil(students.length / rowsPerPageAll);

   // ✅ Pagination for Upload Students
   const [currentPageUpload, setCurrentPageUpload] = useState(1);
   const rowsPerPageUpload = 5;
   const indexOfLastUpload = currentPageUpload * rowsPerPageUpload;
   const indexOfFirstUpload = indexOfLastUpload - rowsPerPageUpload;
   const currentUploadedStudents = uploadedStudents.slice(
      indexOfFirstUpload,
      indexOfLastUpload
   );
   const totalPagesUpload = Math.ceil(uploadedStudents.length / rowsPerPageUpload);

   // 🔹 Edit/Delete Tab Pagination
   const [currentPageEdit, setCurrentPageEdit] = useState(1);
   const rowsPerPageEdit = 5;

   const indexOfLastEdit = currentPageEdit * rowsPerPageEdit;
   const indexOfFirstEdit = indexOfLastEdit - rowsPerPageEdit;
   const currentEditStudents = students.slice(indexOfFirstEdit, indexOfLastEdit);
   const totalPagesEdit = Math.ceil(students.length / rowsPerPageEdit);


   // Lifecycle
   useEffect(() => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
   }, []);

   useEffect(() => {
      fetch("http://localhost:5000/api/students")
         .then((res) => res.json())
         .then((data) => setStudents(data))
         .catch((err) => console.error("Error fetching students:", err));
   }, []);

   const handleLogout = () => {
      navigate("/");
   };

   // CRUD + Upload
   const handleEdit = (student) => {
      setSelectedStudent({ ...student });
      setIsModalOpen(true);
   };

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setSelectedStudent((prev) => ({
         ...prev,
         [name]: value,
      }));
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

         const newStudents = rows.map((row, index) => ({
            id: Date.now().toString() + index,
            name: row.Name || row.name || "",
            email: row.Email || row.email || "",
            usn: row.USN || row.usn || "",
            division: row.Division || row.division || "",
            gender: row.Gender || row.gender || ""
         }));

         setUploadedStudents(newStudents);
         setCurrentPageUpload(1);
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

   // Validation + Commit
   const handleValidate = () => {
      if (uploadedStudents.length === 0) {
         toast.error("❌ No data to validate.");
         return;
      }

      fetch("http://localhost:5000/api/students/validate", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(uploadedStudents),
      })
         .then((res) => {
            if (!res.ok) throw new Error("Validation failed");
            return res.json();
         })
         .then((validatedData) => {
            setUploadedStudents(validatedData);
            toast.success("✅ Validation complete. Check the Status column.");
            setIsValidated(validatedData.every(stu => stu.status === "Valid"));
         })
         .catch((err) => {
            console.error("Validation error:", err);
            toast.error("❌ Error validating data. Check backend.");
         });
   };

   const handleCommit = (dataToSave) => {
      fetch("http://localhost:5000/api/students/commitData", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(dataToSave),
      })
         .then((res) => {
            if (!res.ok) throw new Error("Failed to commit students");
            return res.json();
         })
         .then((result) => {
            toast.success(`✅ ${result.inserted} students committed, ${result.skipped} skipped!`);
            fetch("http://localhost:5000/api/students")
               .then((res) => res.json())
               .then((data) => setStudents(data));
            setUploadedStudents([]);
            setIsValidated(false);
         })
         .catch((err) => {
            console.error("Error committing students:", err);
            toast.error("❌ Error committing students.");
         });
   };

   const handleBulkUpdate = () => {
      fetch("http://localhost:5000/api/students/bulk-update", {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(students),
      })
         .then((res) => {
            if (!res.ok) throw new Error("Failed to update students");
            return res.json();
         })
         .then((result) => {
            toast.success(`✅ ${result.updated} students updated!`);
            fetch("http://localhost:5000/api/students")
               .then((res) => res.json())
               .then((data) => setStudents(data));
         })
         .catch((err) => {
            console.error("Error updating students:", err);
            toast.error("❌ Error updating students.");
         });
   };

   return (
      <div className="manage-container">
         <SideBar />
         <div className="student">
            <Navbar title="Manage Students" user={user} onLogout={handleLogout} />

            {/* ✅ Tabs */}
            <div className="tabs">
               <button className={`tab ${activeTab === "all" ? "active-tab" : ""}`} onClick={() => setActiveTab("all")}>
                  Upload New
               </button>
               <button className={`tab ${activeTab === "add" ? "active-tab" : ""}`} onClick={() => setActiveTab("add")}>
                  Edit/Delete
               </button>
               <button className={`tab ${activeTab === "settings" ? "active-tab" : ""}`} onClick={() => setActiveTab("settings")}>
                  View
               </button>
            </div>

            <ToastContainer position="top-right" autoClose={3000} />

            {/* ✅ Upload New Tab */}
            {activeTab === "all" && (
               <>
                  <div className="upload-btn-container">
                     <input type="file" accept=".xlsx, .xls" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileUpload} />
                     <button className="upload-btn" onClick={handleClick}>
                        <FaUpload style={{ marginRight: "8px" }} /> Click to Upload
                     </button>
                  </div>

                  <table className="students-table">
                     <thead>
                        <tr>
                           <th>Sl No</th>
                           <th>Name</th>
                           <th>Email</th>
                           <th>USN</th>
                           <th>Division</th>
                           <th>Gender</th>
                           <th>Status</th>
                           <th style={{ textAlign: "center" }}>Delete</th>
                        </tr>
                     </thead>
                     <tbody>
                        {currentUploadedStudents.map((student, index) => (
                           <tr key={student.id}>
                              <td>{indexOfFirstUpload + index + 1}</td>
                              <td>{student.name}</td>
                              <td>{student.email}</td>
                              <td>{student.usn}</td>
                              <td>{student.division}</td>
                              <td>{student.gender}</td>
                              <td className={`status-cell ${student.status === "Valid" ? "status-success" : "status-error"}`}>
                                 {student.status}
                              </td>
                              <td style={{ textAlign: "center" }}>
                                 <button
                                    onClick={() => setUploadedStudents(prev => prev.filter(stu => stu.id !== student.id))}
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
                           uploadedStudents.length <= rowsPerPageUpload ||
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
                           uploadedStudents.length <= rowsPerPageUpload ||
                           currentPageUpload === totalPagesUpload
                        }
                     >
                        Next
                     </button>
                  </div>


                  <div className="belowButton">
                     <button className="add-btn" onClick={handleValidate} disabled={uploadedStudents.length === 0}>Validate</button>
                     <button className={`add-btn ${!isValidated ? "disabled-btn" : ""}`} onClick={() => handleCommit(uploadedStudents)} disabled={!isValidated}>
                        Commit
                     </button>
                  </div>
               </>
            )}

            {/* ✅ Edit/Delete Tab */}
            {activeTab === "add" && (
               <>
                  <table className="students-table">
                     <thead>
                        <tr>
                           <th>Sl No</th>
                           <th>Name</th>
                           <th>Email</th>
                           <th>USN</th>
                           <th>Division</th>
                           <th>Gender</th>
                           <th style={{ textAlign: "center" }}>Edit</th>
                           <th style={{ textAlign: "center" }}>Delete</th>
                        </tr>
                     </thead>
                     <tbody>
                        {currentStudents.length > 0 ? (
                           currentStudents.map((student, index) => (
                              <tr key={student.id}>
                                 <td>{indexOfFirstRowAll + index + 1}</td>
                                 <td>{student.name}</td>
                                 <td>{student.email}</td>
                                 <td>{student.usn}</td>
                                 <td>{student.division}</td>
                                 <td>{student.gender}</td>
                                 <td style={{ textAlign: "center" }}>
                                    <button onClick={() => handleEdit(student)} className="edit-btn"><FaEdit /></button>
                                 </td>
                                 <td style={{ textAlign: "center" }}>
                                    <button onClick={() => handleDelete(student)} className="delete-btn"><FaTrash /></button>
                                 </td>
                              </tr>
                           ))
                        ) : (
                           <tr><td colSpan="8">No students found</td></tr>
                        )}
                     </tbody>
                  </table>

                  {/* Pagination All */}
                  <div className="pagination">
                     <button onClick={() => setCurrentPageEdit(currentPageEdit - 1)} disabled={currentPageEdit === 1}>Prev</button>
                     <span>Page {currentPageEdit} of {totalPagesEdit || 1}</span>
                     <button onClick={() => setCurrentPageEdit(currentPageEdit + 1)} disabled={currentPageEdit === totalPagesEdit}>Next</button>
                  </div>

                  <button className="add-btn" onClick={handleBulkUpdate}>Save Student Details</button>
               </>
            )}

            {/* ✅ View Tab */}
            {activeTab === "settings" && (
               <>
                  <table className="students-table">
                     <thead>
                        <tr>
                           <th>Sl No</th>
                           <th>Name</th>
                           <th>Email</th>
                           <th>USN</th>
                           <th>Division</th>
                           <th>Gender</th>
                        </tr>
                     </thead>
                     <tbody>
                        {currentStudents.length > 0 ? (
                           currentStudents.map((student, index) => (
                              <tr key={student.id}>
                                 <td>{indexOfFirstRowAll + index + 1}</td>
                                 <td>{student.name}</td>
                                 <td>{student.email}</td>
                                 <td>{student.usn}</td>
                                 <td>{student.division}</td>
                                 <td>{student.gender}</td>
                              </tr>
                           ))
                        ) : (
                           <tr><td colSpan="6">No students found</td></tr>
                        )}
                     </tbody>
                  </table>

                  {/* Pagination All */}
                  <div className="pagination">
                     <button onClick={() => setCurrentPageAll(currentPageAll - 1)} disabled={currentPageAll === 1}>Prev</button>
                     <span>Page {currentPageAll} of {totalPagesAll || 1}</span>
                     <button onClick={() => setCurrentPageAll(currentPageAll + 1)} disabled={currentPageAll === totalPagesAll}>Next</button>
                  </div>
               </>
            )}

            {/* Edit Modal */}
            {isModalOpen && selectedStudent && (
               <div className="modal-overlay">
                  <div className="modal-content">
                     <h2>Edit Student</h2>
                     <label>Name:</label>
                     <input type="text" name="name" value={selectedStudent.name} onChange={handleInputChange} />
                     <label>Email:</label>
                     <input type="email" name="email" value={selectedStudent.email} onChange={handleInputChange} />
                     <label>USN:</label>
                     <input type="text" name="usn" value={selectedStudent.usn} onChange={handleInputChange} />
                     <label>Gender:</label>
                     <select name="gender" value={selectedStudent.gender || ""} onChange={handleInputChange}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                     </select>
                     <div className="modal-actions">
                        <button onClick={handleSave} className="save-btn">Save</button>
                        <button onClick={() => setIsModalOpen(false)} className="cancel-btn">Cancel</button>
                     </div>
                  </div>
               </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && studentToDelete && (
               <div className="modal-overlay">
                  <div className="modal-content">
                     <h2>Confirm Delete</h2>
                     <p>Are you sure you want to delete <strong>{studentToDelete.name}</strong>?</p>
                     <div className="modal-actions">
                        <button onClick={confirmDelete} className="delete-btn">Yes, Delete</button>
                        <button onClick={() => setIsDeleteModalOpen(false)} className="cancel-btn">Cancel</button>
                     </div>
                  </div>
               </div>
            )}

         </div>
      </div>
   );
}

export default ManageStudents;
