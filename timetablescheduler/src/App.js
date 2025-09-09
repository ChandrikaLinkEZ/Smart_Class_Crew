import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import LoginPage from './LoginPage';
import AdminDashboard from './AdminDashboard';
import ManageStudents from './ManageStudents';

function App() {
  
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/students" element={<ManageStudents />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
