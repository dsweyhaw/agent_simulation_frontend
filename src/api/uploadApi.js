import { axiosInstance } from './axios';

/**
 * Upload GAML file API functions
 */
export const uploadGamlFile = async (projectId, experimentName, gamlFile) => {
  const formData = new FormData();
  formData.append('projectId', projectId);
  formData.append('experimentName', experimentName);
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