import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGigs } from '../context/GigContext';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUtils';

const MyGigs = () => {
  const { myGigs, loading, error, getMyGigs, deleteGig } = useGigs();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(null);

  useEffect(() => {
    if (user && user.role === 'freelancer') {
      getMyGigs();
    }
  }, [user, getMyGigs]); // Added getMyGigs back since it's now stable

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this gig?')) {
      setIsDeleting(id);
      const result = await deleteGig(id);
      if (result.success) {
        // Refresh the list
        getMyGigs();
      }
      setIsDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading your gigs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Gigs</h1>
            <div className="space-x-4">
              <Link
                to="/create-gig"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Create New Gig
              </Link>
              <Link
                to="/dashboard"
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Dashboard
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {myGigs.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                No gigs created yet
              </h3>
              <p className="text-gray-600 mb-8">
                Start by creating your first gig to attract clients.
              </p>
              <Link
                to="/create-gig"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Create Your First Gig
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myGigs.map((gig) => (
                <div key={gig._id} className="bg-white overflow-hidden shadow rounded-lg">
                  {gig.images && gig.images.length > 0 && (
                    <img
                      className="h-48 w-full object-cover"
                      src={getImageUrl(gig.images[0])}
                      alt={gig.title}
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {gig.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {gig.description}
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold text-green-600">
                        ${gig.price}
                      </span>
                      <span className="text-sm text-gray-500">
                        {gig.category}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Delivery: {gig.deliveryTime} days
                      </span>
                      <div className="space-x-2">
                        <Link
                          to={`/gigs/${gig._id}/edit`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(gig._id)}
                          disabled={isDeleting === gig._id}
                          className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                        >
                          {isDeleting === gig._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyGigs;
