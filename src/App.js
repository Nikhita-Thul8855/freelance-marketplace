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
import MyGigs from './components/MyGigs';
import GigList from './components/GigList';
import GigDetails from './components/GigDetails';
import Orders from './components/Orders';
import OrderDetails from './components/OrderDetails';
import PaymentSuccess from './components/PaymentSuccess';

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
            </Routes>
          </div>
        </Router>
      </GigProvider>
    </AuthProvider>
    </StripeProvider>
  );
}

export default App;
