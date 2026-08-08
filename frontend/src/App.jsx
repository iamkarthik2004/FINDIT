import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import LostItems from './pages/LostItems';
import FoundItems from './pages/FoundItems';
import ItemDetails from './pages/ItemDetails';
import ReportLost from './pages/ReportLost';
import ReportFound from './pages/ReportFound';
import MyReports from './pages/MyReports';
import Claims from './pages/Claims';
import Login from './pages/Login';
import Register from './pages/Register';
import HowItWorks from './pages/HowItWorks';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import Contact from './pages/Contact';
import Chats, { ChatConversation } from './pages/Chats';
import { AdminRoute, ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/lost" element={<LostItems />} />
              <Route path="/found" element={<FoundItems />} />
              <Route path="/item/:id" element={<ItemDetails />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/report-lost" element={<ReportLost />} />
                <Route path="/report-found" element={<ReportFound />} />
                <Route path="/my-reports" element={<MyReports />} />
                <Route path="/claims" element={<Claims />} />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/chats" element={<Chats />} />
              <Route path="/chats/:chatId" element={<ChatConversation />} />
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
