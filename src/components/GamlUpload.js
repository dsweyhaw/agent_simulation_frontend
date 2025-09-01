import React, { useState } from 'react';
import { uploadGamlFile } from '../api/uploadApi';

const GamlUpload = ({ projectId, onUploadSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    experimentName: '',
    gamlFile: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file extension
      if (!file.name.toLowerCase().endsWith('.gaml')) {
        setError('Please select a .gaml file');
        return;
      }
      setFormData(prev => ({
        ...prev,
        gamlFile: file
      }));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    // if (!formData.experimentName.trim()) {
    //   setError('Experiment name is required');
    //   return;
    // }
    
    if (!formData.gamlFile) {
      setError('Please select a GAML file');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await uploadGamlFile(projectId, formData.experimentName, formData.gamlFile);

      if (response.data.status === 'success') {
        setSuccess('GAML file uploaded and validated successfully!');
        
        // Reset form
        setFormData({
          experimentName: '',
          gamlFile: null
        });
        
        // Reset file input
        const fileInput = document.getElementById('gamlFile');
        if (fileInput) fileInput.value = '';

        // Call success callback with detailed logging
        console.log('GAML Upload Success - Full Response:', response.data);
        console.log('GAML Upload Success - Data to pass:', response.data.data);
        if (onUploadSuccess) {
          onUploadSuccess(response.data.data);
        }

        // Auto close after success
        setTimeout(() => {
          if (onClose) onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.data?.details) {
        setError(error.response.data.details);
      } else {
        setError('Failed to upload GAML file. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Upload GAML File
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Experiment Name Input */}
          <div>
            <label htmlFor="experimentName" className="block text-sm font-medium text-gray-700 mb-1">
              Experiment Name (Optional)
            </label>
            <input
              type="text"
              id="experimentName"
              name="experimentName"
              value={formData.experimentName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter experiment name"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              If provided, an experiment will be created along with the model. Leave empty to create only the model.
            </p>
          </div>

          {/* File Upload */}
          <div>
            <label htmlFor="gamlFile" className="block text-sm font-medium text-gray-700 mb-1">
              GAML File *
            </label>
            <input
              type="file"
              id="gamlFile"
              name="gamlFile"
              onChange={handleFileChange}
              accept=".gaml"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={loading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Only .gaml files are allowed
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </div>
              ) : (
                'Upload & Validate'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GamlUpload;