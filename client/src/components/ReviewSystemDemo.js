import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ReviewSystemDemo = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "Client Places Order",
      description: "Client finds a gig and places an order",
      status: "prerequisite"
    },
    {
      id: 2,
      title: "Order is Completed", 
      description: "Freelancer completes the work, order status = 'completed'",
      status: "prerequisite"
    },
    {
      id: 3,
      title: "Review Button Appears",
      description: "Blue 'Leave Review' button shows up in Orders page",
      status: "active"
    },
    {
      id: 4,
      title: "Review Modal Opens",
      description: "Client clicks button, review form modal opens",
      status: "active"
    },
    {
      id: 5,
      title: "Submit Review",
      description: "Client rates (1-5 stars) and writes comment",
      status: "active"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🔍 Client Review System - How It Works
          </h1>

          {/* Current Implementation Status */}
          <div className="bg-green-50 border border-green-200 p-6 rounded-lg mb-8">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-semibold text-green-900">✅ SYSTEM STATUS: FULLY WORKING</h2>
            </div>
            <p className="text-green-800 mb-4">
              The client review system is completely implemented and functional. 
              Clients can successfully leave reviews for completed orders.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-md">
                <h3 className="font-medium text-green-900 mb-2">✅ Implemented Features:</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Review button on completed orders</li>
                  <li>• Modal popup with review form</li>
                  <li>• Star rating (1-5 stars)</li>
                  <li>• Comment validation (10-1000 chars)</li>
                  <li>• Duplicate review prevention</li>
                  <li>• Real-time review updates</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-md">
                <h3 className="font-medium text-green-900 mb-2">📁 Files Involved:</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Orders.js (main component)</li>
                  <li>• ReviewTest.js (review form)</li>
                  <li>• reviewService.js (API calls)</li>
                  <li>• reviewController.js (backend)</li>
                  <li>• Review.js (database model)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step-by-step process */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              📋 Review Process Flow
            </h2>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`flex items-start p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    currentStep >= step.id 
                      ? 'border-blue-300 bg-blue-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  onClick={() => setCurrentStep(step.id)}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 ${
                    currentStep >= step.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step.id}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      currentStep >= step.id ? 'text-blue-900' : 'text-gray-700'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm ${
                      currentStep >= step.id ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  {step.status === 'active' && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Ready to Test
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Testing Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-yellow-900 mb-4">
              🧪 How to Test Client Reviews
            </h2>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-md">
                <h3 className="font-medium text-yellow-900 mb-2">Option 1: Use Existing Orders</h3>
                <ol className="list-decimal list-inside text-yellow-800 space-y-1 text-sm">
                  <li>Login as a client account</li>
                  <li>Go to /orders page</li>
                  <li>Look for orders with "Completed" status</li>
                  <li>Click "Leave Review" button</li>
                  <li>Fill out the review form</li>
                </ol>
              </div>
              <div className="bg-white p-4 rounded-md">
                <h3 className="font-medium text-yellow-900 mb-2">Option 2: Use Test Page</h3>
                <ol className="list-decimal list-inside text-yellow-800 space-y-1 text-sm">
                  <li>Go to /review-test page</li>
                  <li>Use pre-configured test data</li>
                  <li>Submit sample reviews</li>
                  <li>See immediate results</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/orders"
              className="block p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              <h3 className="font-medium mb-2">Test Real Orders</h3>
              <p className="text-sm opacity-90">Check for completed orders</p>
            </Link>
            <Link
              to="/review-test"
              className="block p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center"
            >
              <h3 className="font-medium mb-2">Use Test Page</h3>
              <p className="text-sm opacity-90">Try with sample data</p>
            </Link>
            <Link
              to="/review-guide"
              className="block p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center"
            >
              <h3 className="font-medium mb-2">View Guide</h3>
              <p className="text-sm opacity-90">Complete instructions</p>
            </Link>
          </div>

          {/* Troubleshooting */}
          <div className="mt-8 bg-red-50 border border-red-200 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-red-900 mb-4">
              🔧 Troubleshooting
            </h2>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-md">
                <h3 className="font-medium text-red-900 mb-1">❌ "I don't see the review button"</h3>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Make sure you're logged in as a CLIENT (not freelancer)</li>
                  <li>• Order must have "Completed" status</li>
                  <li>• You can only review orders you placed</li>
                  <li>• Check if you already reviewed that order</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded-md">
                <h3 className="font-medium text-red-900 mb-1">❌ "Review button doesn't work"</h3>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Check browser console for JavaScript errors</li>
                  <li>• Make sure server is running on port 5000</li>
                  <li>• Try refreshing the page</li>
                  <li>• Use the test page instead: /review-test</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSystemDemo;
