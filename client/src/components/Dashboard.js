import React from 'react';
import { useAuth } from '../context/AuthContext';
import FreelancerDashboard from './FreelancerDashboard';
import ClientDashboard from './ClientDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Route to appropriate dashboard based on user role
  if (user?.role === 'freelancer') {
    return <FreelancerDashboard />;
  } else if (user?.role === 'client') {
    return <ClientDashboard />;
  } else if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  // Fallback for users without defined roles
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome!</h1>
        <p className="text-gray-600">Please complete your profile setup to access your dashboard.</p>
      </div>
    </div>
  );
};

export default Dashboard;


