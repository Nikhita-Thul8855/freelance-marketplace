import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ReviewGuide = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            📝 How to Leave Reviews on FreelanceHub
          </h1>

          <div className="space-y-6">
            {/* Method 1: Through Orders */}
            <div className="border-l-4 border-blue-500 pl-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                ✅ Method 1: Review Your Completed Orders (Recommended)
              </h2>
              <p className="text-gray-700 mb-4">
                This is the most common way to leave reviews - after you've completed an order as a client.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h3 className="font-medium text-blue-900 mb-2">Steps:</h3>
                <ol className="list-decimal list-inside text-blue-800 space-y-1">
                  <li>Go to your Orders page (as a CLIENT)</li>
                  <li>Find an order with "Completed" status</li>
                  <li>Click "Leave Review" button (blue button)</li>
                  <li>A modal will open with review form</li>
                  <li>Rate (1-5 stars) and write your comment</li>
                  <li>Submit your review</li>
                </ol>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-4">
                <p className="text-amber-800 text-sm">
                  <strong>Note:</strong> Only clients can leave reviews for gigs they've ordered. 
                  You must complete the order first before the review option appears.
                </p>
              </div>
              <Link
                to="/orders"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Go to My Orders →
              </Link>
            </div>

            {/* Method 2: Test Page */}
            <div className="border-l-4 border-green-500 pl-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                🧪 Method 2: Review Test Page (For Testing)
              </h2>
              <p className="text-gray-700 mb-4">
                Use this page to test the review functionality with sample data.
              </p>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <h3 className="font-medium text-green-900 mb-2">Features:</h3>
                <ul className="list-disc list-inside text-green-800 space-y-1">
                  <li>Submit test reviews</li>
                  <li>See reviews list in real-time</li>
                  <li>Test rating and comment validation</li>
                  <li>View review statistics</li>
                </ul>
              </div>
              <Link
                to="/review-test"
                className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Try Review Test Page →
              </Link>
            </div>

            {/* Method 3: Gig Details */}
            <div className="border-l-4 border-purple-500 pl-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                👀 Method 3: View Reviews on Gig Pages
              </h2>
              <p className="text-gray-700 mb-4">
                See existing reviews when browsing gigs (you can only leave reviews through orders).
              </p>
              <div className="bg-purple-50 p-4 rounded-lg mb-4">
                <h3 className="font-medium text-purple-900 mb-2">What you can see:</h3>
                <ul className="list-disc list-inside text-purple-800 space-y-1">
                  <li>All reviews for a specific gig</li>
                  <li>Average rating and statistics</li>
                  <li>Individual user reviews with ratings</li>
                  <li>Freelancer responses to reviews</li>
                </ul>
              </div>
              <Link
                to="/gigs"
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Browse Gigs →
              </Link>
            </div>

            {/* Admin Section */}
            {user?.role === 'admin' && (
              <div className="border-l-4 border-red-500 pl-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  ⚙️ Admin: Manage All Reviews
                </h2>
                <p className="text-gray-700 mb-4">
                  As an admin, you can manage all reviews on the platform.
                </p>
                <Link
                  to="/admin/reviews"
                  className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  Manage Reviews →
                </Link>
              </div>
            )}

            {/* Current User Status */}
            <div className="bg-gray-100 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                👤 Your Current Status:
              </h3>
              {user ? (
                <div className="space-y-2">
                  <p><span className="font-medium">Logged in as:</span> {user.name} ({user.email})</p>
                  <p><span className="font-medium">Role:</span> {user.role}</p>
                  <p className="text-sm text-gray-600">
                    {user.role === 'client' 
                      ? '✅ You can leave reviews for completed orders'
                      : user.role === 'freelancer'
                      ? '💬 You can respond to reviews on your gigs'
                      : user.role === 'admin'
                      ? '⚙️ You can manage all reviews'
                      : 'ℹ️ Contact admin for specific permissions'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-gray-700">You are not logged in.</p>
                  <p className="text-sm text-gray-600">
                    📋 To leave reviews, you need to:
                  </p>
                  <ol className="list-decimal list-inside text-sm text-gray-600 ml-4">
                    <li>Create an account or sign in</li>
                    <li>Place an order for a gig</li>
                    <li>Wait for the order to be completed</li>
                    <li>Leave a review through your orders page</li>
                  </ol>
                  <div className="flex space-x-4 mt-4">
                    <Link
                      to="/login"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Navigation */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                🚀 Quick Navigation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  to="/dashboard"
                  className="block p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="font-medium text-gray-900">Dashboard</div>
                  <div className="text-sm text-gray-600">Your main control panel</div>
                </Link>
                <Link
                  to="/orders"
                  className="block p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="font-medium text-gray-900">My Orders</div>
                  <div className="text-sm text-gray-600">View and review orders</div>
                </Link>
                <Link
                  to="/gigs"
                  className="block p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="font-medium text-gray-900">Browse Gigs</div>
                  <div className="text-sm text-gray-600">See gigs and their reviews</div>
                </Link>
                <Link
                  to="/review-test"
                  className="block p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="font-medium text-gray-900">Test Reviews</div>
                  <div className="text-sm text-gray-600">Try the review system</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewGuide;
