import React, { useState, useEffect } from "react";
import "./SettingsPage.css";
import SideBar from "../Refs/SideBar";
import { useNavigate } from "react-router-dom";
import Navbar from "../Refs/Navbar";

const initialFormState = {
   email: { email: "" },
   notifications: { email: false },
};

function SettingsPage() {
   const navigate = useNavigate();
   const [activeTab, setActiveTab] = useState("general");
   const [formData, setFormData] = useState(initialFormState);
   const [currentEmail, setCurrentEmail] = useState("");
   const [user, setUser] = useState({ name: "", username: "", email: "" });

   const handleLogout = () => {
      navigate("/");
   };

   useEffect(() => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
   }, []);

   useEffect(() => {
      setFormData(initialFormState);
   }, [activeTab]);

   const handleChange = (tab, field, value) => {
      setFormData((prev) => ({
         ...prev,
         [tab]: {
            ...prev[tab],
            [field]: value,
         },
      }));
   }

   return (
      <div className="settings-page">
         <SideBar />

         <main className="settings-content">
            <Navbar title="Settings" user={user} onLogout={handleLogout} />

            <div className="tabs">
               <button className={`tab ${activeTab === "general" ? "active-tab" : ""}`} onClick={() => setActiveTab("general")}>
                  General
               </button>
               <button className={`tab ${activeTab === "email" ? "active-tab" : ""}`} onClick={() => setActiveTab("email")}>
                  Change Email
               </button>
               <button className={`tab ${activeTab === "notifications" ? "active-tab" : ""}`} onClick={() => setActiveTab("notifications")}>
                  Notifications
               </button>
            </div>

            <div className="form-section">
               {activeTab === "general" && (
                  <>
                     <div className="tab-content">
                        <div className="input-group">
                           <label>Name:</label>
                           <div style={{ width: 300, border: "1px solid black", height: 40 }}>
                              <span>{user.name}</span>
                           </div>
                        </div>
                        <div className="input-group">
                           <label>Username:</label>
                           <div style={{ width: 300, border: "1px solid black", height: 40 }}>
                              <span>{user.username}</span>
                           </div>
                        </div>
                        <div className="input-group">
                           <label>Email:</label>
                           <div style={{ width: 300, border: "1px solid black", height: 40 }}>
                              <span>{user.email}</span>
                           </div>
                        </div>
                     </div>
                  </>
               )}

               {activeTab === "email" && (
                  <>
                     <div className="tab-content">
                        <div className="input-group">
                           <label>Current Email:</label>
                           <input
                              type="email"
                              value={currentEmail}
                              disabled={!!currentEmail}
                              style={{ background: "#f6f5f5ff" }}
                           />
                        </div>
                        <div className="input-group">
                           <label>Change Email:</label>
                           <input
                              type="email"
                              value={formData.email.email}
                              onChange={(e) => handleChange("email", "email", e.target.value)}
                           />
                        </div>
                     </div>
                  </>
               )}

               {activeTab === "notifications" && (
                  <>
                     <div className="tab-content">
                        <div className="input-group">
                           <label>Email Notifications:</label>
                           <input
                              type="checkbox"
                              checked={formData.notifications.email}
                              onChange={(e) =>
                                 handleChange("notifications", "email", e.target.checked)
                              }
                           />
                        </div>
                     </div>
                  </>
               )}
            </div>
         </main>
      </div>
   );
}

export default SettingsPage;
