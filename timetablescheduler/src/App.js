import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import LoginPage from './LoginPage';
import AdminDashboard from './Admin/AdminDashboard';
import ManageTeachers from './Admin/ManageTeachers';
// import ManageStudents from './Admin/ManageStudents';
import ManageCourse from './Admin/ManageCourse';
import ManageVenues from './Admin/ManageVenues';
import GenerateTimetable from './Admin/GenerateTimetable';
import SettingsPage from './Admin/SettingsPage';

function App() {
  
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/teachers" element={<ManageTeachers />} />
          {/* <Route path="/students" element={<ManageStudents />} /> */}
          <Route path="/courses" element={<ManageCourse />} />
          <Route path="/venues" element={<ManageVenues />} />
          <Route path="/timetables" element={<GenerateTimetable />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
