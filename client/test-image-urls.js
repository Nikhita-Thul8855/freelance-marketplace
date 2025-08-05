// Test script to verify image URL functionality
import { getImageUrl } from './src/utils/imageUtils.js';

console.log('Testing getImageUrl function:');

// Test 1: Local image path
const localPath = '/uploads/image-123456.jpg';
console.log('Local path:', getImageUrl(localPath));
// Expected: http://localhost:5000/uploads/image-123456.jpg

// Test 2: Cloudinary URL (should return as is)
const cloudinaryUrl = 'https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg';
console.log('Cloudinary URL:', getImageUrl(cloudinaryUrl));
// Expected: https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg

// Test 3: Empty/null path
console.log('Empty path:', getImageUrl(''));
console.log('Null path:', getImageUrl(null));
// Expected: empty string for both
