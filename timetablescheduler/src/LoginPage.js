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
      <div className="login-wrapper">
         {/* Left Branding Section */}
         <div className="login-left">
            <div className="brand">
               <h1>Smart Class Crew</h1>
               <p>Empowering Learning. Driving Collaboration.</p>
            </div>
         </div>

         {/* Right Login Section */}
         <div className="login-right">
            <div className="form-box">
               <h2 className="form-header">Welcome Back</h2>
               <p className="form-subtitle">Please sign in to continue</p>

               {errorMessage && <div className="alert error">{errorMessage}</div>}
               {successMessage && <div className="alert success">{successMessage}</div>}

               <form onSubmit={handleLogin} className="login-form">
                  {/* Role Dropdown */}
                  <div className="form-group">
                     <label htmlFor="role">Choose Role</label>
                     <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                     >
                        <option value="" disabled>Select your role</option>
                        <option value="admin">Admin</option>
                        <option value="teacher">Teacher</option>
                        <option value="student">Student</option>
                     </select>
                  </div>

                  {/* Email Input */}
                  <div className="form-group">
                     <label htmlFor="email">Enter Email</label>
                     <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                     />
                  </div>

                  {/* USN Input */}
                  {role === "student" && (
                     <div className="form-group">
                        <label htmlFor="usn">Enter USN</label>
                        <input
                           id="usn"
                           type="text"
                           placeholder="Enter USN"
                           value={usn}
                           onChange={(e) => setUSN(e.target.value.toUpperCase())}
                           required
                        />
                     </div>
                  )}

                  {/* Password Input with Eye Toggle */}
                  {/* <div className="form-group password-wrapper">
                     <label htmlFor="password">Password</label>
                     <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter Password"
                        required
                     />
                     <span
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                     >
                        {showPassword ? "👁️" : "🙈"}
                     </span>
                  </div> */}

                  <button type="submit" className="login-btn">Sign In</button>
               </form>

            </div>
         </div>
      </div>
   );

}

export default LoginPage;