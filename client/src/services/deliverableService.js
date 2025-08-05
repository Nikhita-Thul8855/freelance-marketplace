import api from './api';

class DeliverableService {
  // Upload deliverable
  async uploadDeliverable(orderId, title, description, files) {
    try {
      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('title', title);
      formData.append('description', description);
      
      // Add files
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await api.post('/deliverables', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to upload deliverable'
      };
    }
  }

  // Get deliverables for an order
  async getOrderDeliverables(orderId) {
    try {
      const response = await api.get(`/deliverables/order/${orderId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch deliverables'
      };
    }
  }

  // Get my deliverables (freelancer)
  async getMyDeliverables(page = 1, limit = 10, status = null) {
    try {
      let url = `/deliverables/my-deliverables?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }
      
      const response = await api.get(url);
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch deliverables'
      };
    }
  }

  // Download deliverable file
  async downloadFile(deliverableId, filename) {
    try {
      const response = await api.get(`/deliverables/${deliverableId}/download/${filename}`, {
        responseType: 'blob'
      });
      
      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to download file'
      };
    }
  }

  // Approve deliverable (client)
  async approveDeliverable(deliverableId, feedback = '', rating = null) {
    try {
      const response = await api.put(`/deliverables/${deliverableId}/approve`, {
        feedback,
        rating
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to approve deliverable'
      };
    }
  }

  // Request revision (client)
  async requestRevision(deliverableId, reason, dueDate = null) {
    try {
      const response = await api.put(`/deliverables/${deliverableId}/revision`, {
        reason,
        dueDate
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to request revision'
      };
    }
  }

  // Get status badge color
  getStatusColor(status) {
    const colors = {
      submitted: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      revision_requested: 'bg-orange-100 text-orange-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  // Get status display text
  getStatusText(status) {
    const texts = {
      submitted: 'Submitted',
      approved: 'Approved',
      revision_requested: 'Revision Requested',
      rejected: 'Rejected'
    };
    return texts[status] || status;
  }

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file type icon
  getFileTypeIcon(mimetype) {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype.startsWith('video/')) return '🎥';
    if (mimetype.startsWith('audio/')) return '🎵';
    if (mimetype.includes('pdf')) return '📄';
    if (mimetype.includes('word')) return '📝';
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return '📊';
    if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return '📈';
    if (mimetype.includes('zip') || mimetype.includes('rar')) return '📦';
    return '📎';
  }
}

const deliverableService = new DeliverableService();
export default deliverableService;
