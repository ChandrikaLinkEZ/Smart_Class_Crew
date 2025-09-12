import React, { useState, useEffect } from "react";
import "./SettingsPage.css";
import SideBar from "../Refs/SideBar";
import { Navigate, useNavigate } from "react-router-dom";
import Navbar from "../Refs/Navbar";

const initialFormState = {
   email: { email: "" },
   notifications: { email: false }
};

const SettingsPage = () => {
   const navigate = useNavigate();
   const [activeTab, setActiveTab] = useState("general");
   const [formData, setFormData] = useState(initialFormState);
   const [currentEmail, setCurrentEmail] = useState('');
   const [user, setUser] = useState({ name: "", username: "", email: "" });

   const handleLogout = () => {
      navigate("/");
   };

   useEffect(() => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
   }, []);

   // Reset form data when tab changes
   useEffect(() => {
      setFormData(initialFormState);
   }, [activeTab]);

   const handleChange = (tab, field, value) => {
      setFormData((prev) => ({
         ...prev,
         [tab]: {
            ...prev[tab],
            [field]: value
         }
      }));
   };

   const renderContent = () => {
      switch (activeTab) {
         case "general":
            return (
               <div className="tab-content">
                  <div className="input-group">
                     <label>Name:</label>
                     <div style={{ width: 300, border: '1px solid black', height: 40 }}>
                        <text >{user.name}</text>
                     </div>
                  </div>
                  <div className="input-group">
                     <label>Username:</label>
                     <div style={{ width: 300, border: '1px solid black', height: 40 }}>
                        <text>{user.username}</text>
                     </div>
                  </div>
                  <div className="input-group">
                     <label>Email:</label>
                     <div style={{ width: 300, border: '1px solid black', height: 40 }}>
                        <text>{user.email}</text>
                     </div>
                  </div>
               </div>
            );

         case "email":
            return (
               <div className="tab-content">
                  <div className="input-group">
                     <label>Current Email:</label>
                     <input
                        type="email"
                        value={currentEmail}
                        disabled={currentEmail}
                        style={{ background: '#f6f5f5ff' }}
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
            );



         case "notifications":
            return (
               <div className="tab-content">
                  <div className="input-group">
                     <label>Email Notifications:</label>
                     <input
                        type="checkbox"
                        checked={formData.notifications.email}
                        onChange={(e) => handleChange("notifications", "email", e.target.checked)}
                     />
                  </div>

               </div>
            );

         default:
            return null;
      }
   };

   return (
      <div className="settings-page">
         <SideBar />

         <main className="settings-content">
            <Navbar title="Settings" user={user} onLogout={handleLogout} />

            <div className="tabs">
               <button onClick={() => setActiveTab("general")} className={activeTab === "general" ? "active" : ""}>General</button>
               <button onClick={() => setActiveTab("email")} className={activeTab === "email" ? "active" : ""}>Change Email</button>
               <button onClick={() => setActiveTab("notifications")} className={activeTab === "notifications" ? "active" : ""}>Notifications</button>
            </div>

            <div className="form-section">
               {renderContent()}
            </div>
         </main>
      </div>
   );
};

export default SettingsPage;