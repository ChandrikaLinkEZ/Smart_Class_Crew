import { useState } from "react";
import "./LoginPage.css"; // Import our CSS
import { useNavigate } from "react-router-dom";

function LoginPage() {
   const navigate = useNavigate();
   const [email, setEmail] = useState("");
   const [role, setRole] = useState(""); // new state for role
   const [usn, setUSN] = useState(""); // new state for USN
   const [errorMessage, setErrorMessage] = useState(""); // 👈 error state
   const [successMessage, setSuccessMessage] = useState(""); // 👈 success state

   const handleLogin = async (e) => {
      e.preventDefault();
      setErrorMessage(""); // clear before new login
      setSuccessMessage("");

      const payload = { email, role, usn };

      try {
         const response = await fetch("http://localhost:5000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
         });

         if (!response.ok) {
            const errorData = await response.json();
            setErrorMessage(errorData.detail || "Login failed"); // 👈 show inline error
            return;
         }

         const data = await response.json();
         console.log("Login success:", data);

         setSuccessMessage("✅ Login successful! Redirecting...");
         localStorage.setItem("user", JSON.stringify(data.user)); 
         setTimeout(() => navigate("/dashboard"), 1500); // redirect after delay
      } catch (error) {
         console.error("Login error:", error);
         setErrorMessage("❌ Could not connect to server");
      }
   };

   return (
      <div className="login-container">
         <div className="login-card">
            <h1 className="login-title">Welcome To</h1>
            <p className="login-subtitle">Sign in to continue to <b>Smart Class Crew</b></p>

            {/* ✅ Inline Alert */}
            {errorMessage && <div className="alert error">{errorMessage}</div>}
            {successMessage && <div className="alert success">{successMessage}</div>}

            <form className="login-form">

               {/* Role Dropdown */}
               <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <select
                     id="role"
                     value={role}
                     onChange={(e) => setRole(e.target.value)}
                     required
                  >
                     <option value="" disabled>
                        Select your role
                     </option>
                     <option value="admin">Admin</option>
                     <option value="teacher">Teacher</option>
                     <option value="student">Student</option>
                  </select>
               </div>

               {/* Email Input */}
               <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                     id="email"
                     type="email"
                     placeholder="you@example.com"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                  />
               </div>

               {/* USN Input - shown only if role is student */}
               {role === "student" && (
                  <div className="form-group">
                     <label htmlFor="usn">USN</label>
                     <input
                        id="usn"
                        type="text"
                        placeholder="Enter USN"
                        value={usn}
                        onChange={(e) => setUSN(e.target.value.toUpperCase())} // 👈 always uppercase
                        required={role === "student"}
                     />
                  </div>
               )}

               <button type="submit" className="login-btn" onClick={handleLogin}>
                  Sign In
               </button>
            </form>

            {/* <div className="divider">
               <span>or</span>
            </div>

            <div className="social-login">
               <button className="social-btn google">Google</button>
               <button className="social-btn facebook">Facebook</button>
            </div>

            <p className="signup-text">
               Don’t have an account?{" "}
               <a href="/register" className="signup-link">Sign up</a>
            </p> */}
         </div>
      </div>
   );
}

export default LoginPage;