import { useEffect, useState } from "react";
import "./ManageCourse.css"; // reuse same theme
import Navbar from "../Refs/Navbar";
import SideBar from "../Refs/SideBar";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import ReactModal from "react-modal";
// import Multiselect from "multiselect-react-dropdown";
ReactModal.setAppElement("#root");

function ManageVenues() {
   const [user, setUser] = useState(null);
   const [venues, setVenues] = useState([]);
   const navigate = useNavigate();
   const [currentPage, setCurrentPage] = useState(1);
   const rowsPerPage = 5;
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
   const [selectedVenue, setSelectedVenue] = useState(null);
   const [venueToDelete, setVenueToDelete] = useState(null);
   const [activeTab, setActiveTab] = useState("add"); // "add" = edit/delete, "view" = readonly

   // Pagination
   const indexOfLastRow = currentPage * rowsPerPage;
   const indexOfFirstRow = indexOfLastRow - rowsPerPage;
   const currentVenues = venues.length > 0 ? venues.slice(indexOfFirstRow, indexOfLastRow) : [];
   const totalPages = venues.length > 0 ? Math.ceil(venues.length / rowsPerPage) : 1;

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

   // const sampleVenues = [
   //    {
   //       id: "v1",
   //       name: "Lecture Hall 101",
   //       capacity: 60,
   //       type: "Lecture Hall",
   //       location: "Block A - 1st Floor"
   //    },
   //    {
   //       id: "v2",
   //       name: "Computer Lab 201",
   //       capacity: 40,
   //       type: "Lab",
   //       location: "Block B - 2nd Floor"
   //    },
   //    {
   //       id: "v3",
   //       name: "Seminar Hall",
   //       capacity: 120,
   //       type: "Seminar",
   //       location: "Main Building - Ground Floor"
   //    },
   //    {
   //       id: "v4",
   //       name: "Electronics Lab",
   //       capacity: 35,
   //       type: "Lab",
   //       location: "Block C - 3rd Floor"
   //    },
   //    {
   //       id: "v5",
   //       name: "Auditorium",
   //       capacity: 300,
   //       type: "Auditorium",
   //       location: "Main Building - Top Floor"
   //    }
   // ];

   useEffect(() => {
      fetch("http://localhost:5000/api/venues")
         .then((res) => res.json())
         .then((data) => {
            setVenues(data);   // update state with array of venues
            // setVenues(sampleVenues);
         })
         .catch((err) => console.error("Error fetching venues:", err));
   }, []);

   const handleEdit = (venue) => {
      setSelectedVenue({ ...venue });
      setIsModalOpen(true);
   };

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setSelectedVenue((prev) => ({ ...prev, [name]: value }));
   };

   const handleSave = () => {
      if (!selectedVenue.venuename || !selectedVenue.venuecode) {
         toast.error("❌ Venue Code and Name are required");
         return;
      }

      // If editing existing Venue
      if (selectedVenue.id) {
         setVenues((prev) =>
            prev.map((c) =>
               c.id === selectedVenue.id ? { ...selectedVenue } : c
            )
         );
         toast.success("✅ Venue updated locally");
      } else {
         // Adding new Venue
         const newVenue = {
            ...selectedVenue,
            id: Date.now(), // temporary unique ID
         };
         setVenues((prev) => [...prev, newVenue]);
         toast.success("✅ Venue added locally");
      }

      setIsModalOpen(false);
      setSelectedVenue(null);
   };

   const handleDelete = (venue) => {
      setVenueToDelete(venue);
      setIsDeleteModalOpen(true);
   };

   const confirmDelete = () => {
      // Local delete only
      setVenues((prev) => prev.filter((c) => c.id !== venueToDelete.id));

      toast.success("✅ Venue deleted locally");

      setIsDeleteModalOpen(false);
      setVenueToDelete(null);
   };

   const handleBulkUpdate = () => {
      fetch(`http://localhost:5000/api/venues/bulk-update`, {
         method: "PUT",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify(venues),
      })
         .then((res) => {
            if (!res.ok) throw new Error("Bulk update failed");
            return res.json();
         })
         .then((data) => {
            toast.success(`✅ ${data.count} Venues updated in DB`);
         })
         .catch((err) => {
            console.error("Error in bulk update:", err);
            toast.error("❌ Error updating Venues");
         });
   };

   return (
      <div className="manage-container">
         <SideBar />

         <div className="student">
            <Navbar title="Manage Venues" user={user} onLogout={handleLogout} />

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
                        setSelectedVenue({});
                        setIsModalOpen(true);
                     }}
                  >
                     <FaPlus style={{ marginRight: "6px" }} />
                     Add Venue
                  </button>

                  <table className="students-table">
                     <thead>
                        <tr>
                           <th>Sl No</th>
                           <th>Code</th>
                           <th>Name</th>
                           <th>Manager</th>
                           <th>Edit</th>
                           <th>Delete</th>
                        </tr>
                     </thead>
                     <tbody>
                        {currentVenues.map((venue, index) => (
                           <tr key={venue._id || venue.id}>
                              <td>{indexOfFirstRow + index + 1}</td>
                              <td>{venue.venuecode}</td>
                              <td>{venue.venuename}</td>
                              <td>{venue.venuemanager}</td>

                              <td>
                                 <button
                                    onClick={() => handleEdit(venue)}
                                    className="edit-btn"
                                 >
                                    <FaEdit />
                                 </button>
                              </td>
                              <td>
                                 <button
                                    onClick={() => handleDelete(venue)}
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

                  <button className="add-btn" onClick={handleBulkUpdate}>Save Venue Details</button>
               </>
            )}

            {activeTab === "view" && (
               <table className="students-table">
                  <thead>
                     <tr>
                        <th>Sl No</th>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Manager</th>
                     </tr>
                  </thead>
                  <tbody>
                     {currentVenues.map((venue, index) => (
                        <tr key={venue.id}>
                           <td>{indexOfFirstRow + index + 1}</td>
                           <td>{venue.code}</td>
                           <td>{venue.name}</td>
                           <td>{venue.manager}</td>
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

               <h2 htmlFor="venue">{selectedVenue?.id ? "Edit Venue" : "Add Venue"}</h2>
               <div className="form-grid">
                  <div className="form-field">
                     <label htmlFor="venuecode">Venue Code</label>
                     <input
                        id="venuecode"
                        type="text"
                        name="venuecode"
                        value={selectedVenue?.venuecode || ""}
                        onChange={handleInputChange}
                     />
                  </div>

                  <div className="form-field">
                     <label htmlFor="venuename">Venue Name</label>
                     <input
                        id="venuename"
                        type="text"
                        name="venuename"
                        value={selectedVenue?.venuename || ""}
                        onChange={handleInputChange}
                     />
                  </div>


                  <div className="form-field">
                     <label htmlFor="manager">Manager</label>
                     <input
                        id="manager"
                        type="text"
                        name="manager"
                        value={selectedVenue?.manager || ""}
                        onChange={handleInputChange}
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
                  <strong>{venueToDelete?.venuecode}{venueToDelete?.venuename}</strong>?
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

export default ManageVenues;