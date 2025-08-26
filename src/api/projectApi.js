import { axiosInstance } from './axios';

/**
 * Project upload API functions
 */
export const uploadProjectZip = async (projectName, zipFile) => {
  const formData = new FormData();
  formData.append('projectName', projectName);
  formData.append('projectZip', zipFile);

  try {
    const response = await axiosInstance.post('/projects/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('Project upload API error:', error);
    throw error;
  }
};

export const finalizeProject = async (projectName, tempDirId, selectedGamlFiles, experimentNames = {}) => {
  try {
    const response = await axiosInstance.post('/projects/finalize', {
      projectName,
      tempDirId,
      selectedGamlFiles,
      experimentNames,
    });
    return response;
  } catch (error) {
    console.error('Project finalize API error:', error);
    throw error;
  }
};

export const cleanupTempDirectory = async (tempDirId) => {
  try {
    const response = await axiosInstance.delete(`/projects/temp/${tempDirId}`);
    return response;
  } catch (error) {
    console.error('Cleanup temp directory API error:', error);
    throw error;
  }
};

export default {
  uploadProjectZip,
  finalizeProject,
  cleanupTempDirectory,
};