import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGigs } from '../context/GigContext';
import { useAuth } from '../context/AuthContext';
import { z } from 'zod';

// Custom validation schema for edit form
const editGigSchema = z.object({
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  
  description: z.string()
    .min(50, 'Description must be at least 50 characters')
    .max(1000, 'Description cannot exceed 1000 characters'),
  
  price: z.string()
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 5, 'Price must be at least $5')
    .refine((val) => !isNaN(val) && val <= 10000, 'Price cannot exceed $10,000'),
  
  category: z.string()
    .min(1, 'Please select a category'),
  
  deliveryTime: z.string()
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 1, 'Delivery time must be at least 1 day')
    .refine((val) => !isNaN(val) && val <= 30, 'Delivery time cannot exceed 30 days'),
  
  tags: z.string().optional()
});

const EditGig = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentGig, getGig, updateGig, loading, error } = useGigs();
  const { user } = useAuth();
  
  console.log('EditGig: Component rendered');
  console.log('EditGig: id from params:', id);
  console.log('EditGig: user:', user);
  console.log('EditGig: loading:', loading);
  console.log('EditGig: error:', error);
  console.log('EditGig: currentGig:', currentGig);
  
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    watch
  } = useForm({
    resolver: zodResolver(editGigSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      category: '',
      deliveryTime: 1,
      tags: ''
    }
  });

  // Watch form values for debugging
  const watchedValues = watch();
  console.log('EditGig: Current form values:', watchedValues);

  useEffect(() => {
    if (id) {
      console.log('EditGig: Fetching gig with ID:', id);
      getGig(id);
    }
  }, [id, getGig]);

  useEffect(() => {
    console.log('EditGig: currentGig changed:', currentGig);
    console.log('EditGig: user:', user);
    
    if (currentGig && user) {
      // Check if user owns this gig
      if (currentGig.seller?._id !== user?._id) {
        console.log('EditGig: User does not own this gig, redirecting...');
        console.log('EditGig: Gig owner ID:', currentGig.seller?._id);
        console.log('EditGig: Current user ID:', user?._id);
        navigate('/my-gigs');
        return;
      }
      
      console.log('EditGig: Populating form with data:', currentGig);
      
      // Prepare form data
      const formData = {
        title: currentGig.title || '',
        description: currentGig.description || '',
        price: Number(currentGig.price) || 0,
        category: currentGig.category || '',
        deliveryTime: Number(currentGig.deliveryTime) || 1,
        tags: currentGig.tags ? currentGig.tags.join(', ') : ''
      };
      
      console.log('EditGig: Form data to reset:', formData);
      
      // Reset form with current gig data
      reset(formData);
      setExistingImages(currentGig.images || []);
    }
  }, [currentGig, user, navigate, reset]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setFormError('');

    try {
      // Create form data
      const submitData = new FormData();
      submitData.append('title', data.title);
      submitData.append('description', data.description);
      submitData.append('price', data.price);
      submitData.append('category', data.category);
      submitData.append('deliveryTime', data.deliveryTime);
      
      // Handle tags - convert string to array and then add each tag
      if (data.tags && data.tags.trim()) {
        const tagArray = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        if (tagArray.length > 0) {
          tagArray.forEach(tag => {
            submitData.append('tags', tag);
          });
        }
      }

      // Handle images
      if (images.length > 0) {
        images.forEach(image => {
          submitData.append('images', image);
        });
      }

      const result = await updateGig(id, submitData);
      
      if (result.success) {
        navigate('/my-gigs');
      } else {
        setFormError(result.error || 'Failed to update gig');
      }
    } catch (error) {
      setFormError('An error occurred while updating the gig');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    console.log('EditGig: Loading state');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading gig details...</div>
      </div>
    );
  }

  if (error) {
    console.log('EditGig: Error state:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            to="/my-gigs"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to My Gigs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Edit Gig</h1>
            <Link
              to="/my-gigs"
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Back to My Gigs
            </Link>
          </div>

          {/* Debug Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <h3 className="font-semibold text-yellow-800">Debug Info:</h3>
            <p className="text-sm text-yellow-700">Current User: {user?.name || 'Not logged in'}</p>
            <p className="text-sm text-yellow-700">User Role: {user?.role || 'None'}</p>
            <p className="text-sm text-yellow-700">User ID: {user?._id || 'None'}</p>
            <p className="text-sm text-yellow-700">Gig ID: {id}</p>
            <p className="text-sm text-yellow-700">Gig Owner: {currentGig?.seller?.name || 'Loading...'}</p>
            <p className="text-sm text-yellow-700">Gig Owner ID: {currentGig?.seller?._id || 'Loading...'}</p>
            <p className="text-sm text-yellow-700">Can Edit: {currentGig?.seller?._id === user?._id ? 'Yes' : 'No'}</p>
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-sm text-red-600">{formError}</p>
            </div>
          )}

          {currentGig && user && (
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Gig Title *
                  </label>
                  <input
                    {...register('title')}
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="I will create a stunning website for your business"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your gig in detail..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Price and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Price ($) *
                  </label>
                  <input
                    {...register('price')}
                    type="number"
                    min="5"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category *
                  </label>
                  <select
                    {...register('category')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a category</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="Design & Creative">Design & Creative</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Writing & Translation">Writing & Translation</option>
                    <option value="Video & Animation">Video & Animation</option>
                    <option value="Music & Audio">Music & Audio</option>
                    <option value="Programming & Tech">Programming & Tech</option>
                    <option value="Data">Data</option>
                    <option value="Business">Business</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>
              </div>

              {/* Delivery Time */}
              <div>
                <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-700">
                  Delivery Time (days) *
                </label>
                <input
                  {...register('deliveryTime')}
                  type="number"
                  min="1"
                  max="30"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.deliveryTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.deliveryTime.message}</p>
                )}
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                  Tags (comma-separated)
                </label>
                <input
                  {...register('tags')}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="react, javascript, web design"
                />
                {errors.tags && (
                  <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>
                )}
              </div>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Images
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={`http://localhost:5000${image}`}
                          alt={`Gig ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              <div>
                <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                  Upload New Images (optional)
                </label>
                <input
                  type="file"
                  id="images"
                  name="images"
                  onChange={handleImageChange}
                  multiple
                  accept="image/*"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  You can upload multiple images. Supported formats: JPG, PNG, GIF
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Gig'}
                </button>
              </div>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditGig;
