import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import AboutUs from './pages/client/aboutus';
import AdminHome from './pages/admin/Home';
import Home from './pages/client/Home';
import Contact from './pages/client/Contact';
import Login from './pages/client/Login';
import './App.css';
import Reservations from './pages/admin/Reservations';
import Users from './pages/admin/Users';
import ClientReservations from './pages/client/clientreservations';
import Analysis from './pages/admin/analysis';
import Hotel from './pages/client/hotel';
import AdminGuard from './components/AdminGuard';
import Register from './pages/client/Register';
import AdminRooms from './pages/admin/Rooms';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route path="" element={<Home />} />
          <Route path="hotel/:id" element={<Hotel />} />
          <Route path="contact" element={<Contact />} />
          <Route path="aboutus" element={<AboutUs />} />
          <Route path="clientreservations" element={<ClientReservations />} />
          <Route path="login" element={<Login/>} />
          <Route path="register" element={<Register/>} />
        </Route> 
        <Route path="/admin" element={ <AdminGuard><AdminLayout /> </AdminGuard>}>
          <Route path="" element={<AdminHome />} />
          <Route path="reservations" element={<Reservations />} />   
          <Route path="users" element={<Users />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="hotels/:hotelId/rooms" element={<AdminRooms />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;