import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GigProvider } from './context/GigContext';
import { StripeProvider } from './context/StripeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CreateGig from './components/CreateGig';
import EditGig from './components/EditGig';
import MyGigs from './components/MyGigs';
import GigList from './components/GigList';
import GigDetails from './components/GigDetails';
import Orders from './components/Orders';
import OrderDetails from './components/OrderDetails';
import PaymentSuccess from './components/PaymentSuccess';
import Messages from './components/Messages';
import UploadDeliverable from './components/UploadDeliverable';
import ReviewTest from './components/ReviewTest';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import AdminUsers from './components/AdminUsers';
import AdminGigs from './components/AdminGigs';
import AdminReviews from './components/AdminReviews';
import AdminDemo from './components/AdminDemo';
import ReviewGuide from './components/ReviewGuide';
import ReviewSystemDemo from './components/ReviewSystemDemo';

function App() {
  return (
    <StripeProvider>
      <AuthProvider>
        <GigProvider>
          <Router>
            <div className="App">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create-gig" 
                element={
                  <ProtectedRoute>
                    <CreateGig />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-gigs" 
                element={
                  <ProtectedRoute>
                    <MyGigs />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/gigs/:id/edit" 
                element={
                  <ProtectedRoute>
                    <EditGig />
                  </ProtectedRoute>
                } 
              />
              <Route path="/gigs" element={<GigList />} />
              <Route path="/gigs/:id" element={<GigDetails />} />
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders/:id" 
                element={
                  <ProtectedRoute>
                    <OrderDetails />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/payment/success" 
                element={
                  <ProtectedRoute>
                    <PaymentSuccess />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/messages" 
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders/:orderId/upload-deliverable" 
                element={
                  <ProtectedRoute>
                    <UploadDeliverable />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/review-test" 
                element={<ReviewTest />} 
              />
              <Route 
                path="/review-guide" 
                element={<ReviewGuide />} 
              />
              <Route 
                path="/review-demo" 
                element={<ReviewSystemDemo />} 
              />
              <Route 
                path="/admin-demo" 
                element={<AdminDemo />} 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute>
                    <AdminUsers />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/gigs" 
                element={
                  <ProtectedRoute>
                    <AdminGigs />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/reviews" 
                element={
                  <ProtectedRoute>
                    <AdminReviews />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </Router>
      </GigProvider>
    </AuthProvider>
    </StripeProvider>
  );
}

export default App;
