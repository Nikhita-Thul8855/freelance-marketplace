// Helper function to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // If it's already a full URL (Cloudinary), return as is
  if (imagePath.startsWith('http')) return imagePath;
  
  // Otherwise, prepend server base URL for local images
  const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  // Remove /api from the end if present
  const baseUrl = serverUrl.replace('/api', '');
  
  return `${baseUrl}${imagePath}`;
};
