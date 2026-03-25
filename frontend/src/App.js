import './App.css';
import { Routes, Route } from 'react-router-dom';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { Home } from './pages/Viewer/Home';
import { AdminDashboard } from './pages/Admin/AdminDashboard';
function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/register" element={<Register />}></Route>
        <Route path="/home" element={<Home />}></Route>
        <Route path="/admin/*" element={<AdminDashboard />}></Route>
      </Routes>
    </div>
  );
}

export default App;
