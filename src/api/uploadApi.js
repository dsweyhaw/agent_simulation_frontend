import { axiosInstance } from './axios';

/**
 * Upload GAML file API functions
 */
export const uploadGamlFile = async (projectId, experimentName, gamlFile) => {
  const formData = new FormData();
  formData.append('projectId', projectId);
  
  // Always append experiment name (even if empty) since @ModelAttribute expects all parameters
  formData.append('experimentName', experimentName ? experimentName.trim() : '');
  
  formData.append('gamlFile', gamlFile);

  try {
    const response = await axiosInstance.post('/models/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('Upload API error:', error);
    throw error;
  }
};

export default {
  uploadGamlFile,
};