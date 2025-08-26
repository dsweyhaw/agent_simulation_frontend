import React, { useState } from 'react';
import { uploadProjectZip, finalizeProject, cleanupTempDirectory } from '../api/projectApi';

const ProjectUpload = ({ onUploadSuccess, onClose }) => {
  const [step, setStep] = useState(1); // 1: Upload ZIP, 2: Select GAML files
  const [formData, setFormData] = useState({
    projectName: '',
    zipFile: null
  });
  const [tempData, setTempData] = useState({
    tempDirId: '',
    gamlFiles: []
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [experimentNames, setExperimentNames] = useState({});
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
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file extension
      if (!file.name.toLowerCase().endsWith('.zip')) {
        setError('Please select a .zip file');
        return;
      }
      setFormData(prev => ({
        ...prev,
        zipFile: file
      }));
      setError('');
    }
  };

  const handleFileSelection = (relativePath, isSelected) => {
    setSelectedFiles(prev => {
      if (isSelected) {
        return [...prev, relativePath];
      } else {
        return prev.filter(file => file !== relativePath);
      }
    });
  };

  const handleExperimentNameChange = (relativePath, experimentName) => {
    setExperimentNames(prev => ({
      ...prev,
      [relativePath]: experimentName
    }));
  };

  const handleUploadZip = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.projectName.trim()) {
      setError('Project name is required');
      return;
    }
    
    if (!formData.zipFile) {
      setError('Please select a ZIP file');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await uploadProjectZip(formData.projectName, formData.zipFile);

      if (response.data.status === 'success') {
        const { tempDirId, gamlFiles, detectedProjectName } = response.data.data;
        setTempData({ tempDirId, gamlFiles });
        
        // Update project name with detected name if available
        if (detectedProjectName) {
          setFormData(prev => ({ ...prev, projectName: detectedProjectName }));
        }
        
        // Pre-select valid GAML files
        const validFiles = gamlFiles
          .filter(file => file.isValid)
          .map(file => file.relativePath);
        setSelectedFiles(validFiles);
        
        setStep(2);
        setSuccess('ZIP file uploaded successfully! Please select GAML files to include.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.data?.details) {
        setError(error.response.data.details);
      } else {
        setError('Failed to upload ZIP file. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeProject = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one GAML file');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await finalizeProject(
        formData.projectName,
        tempData.tempDirId,
        selectedFiles,
        experimentNames
      );

      if (response.data.status === 'success') {
        setSuccess('Project created successfully!');
        
        // Call success callback
        if (onUploadSuccess) {
          onUploadSuccess(response.data.data);
        }

        // Auto close after success
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Finalize error:', error);
      
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.data?.details) {
        setError(error.response.data.details);
      } else {
        setError('Failed to create project. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    // Cleanup temp directory if exists
    if (tempData.tempDirId) {
      try {
        await cleanupTempDirectory(tempData.tempDirId);
      } catch (error) {
        console.warn('Failed to cleanup temp directory:', error);
      }
    }
    
    if (onClose) onClose();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {step === 1 ? 'Upload Project ZIP' : 'Select GAML Files'}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step 1: Upload ZIP */}
        {step === 1 && (
          <form onSubmit={handleUploadZip} className="space-y-4">
            {/* Project Name Input */}
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                id="projectName"
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter project name"
                disabled={loading}
                required
              />
            </div>

            {/* ZIP File Upload */}
            <div>
              <label htmlFor="zipFile" className="block text-sm font-medium text-gray-700 mb-1">
                Project ZIP File *
              </label>
              <input
                type="file"
                id="zipFile"
                name="zipFile"
                onChange={handleFileChange}
                accept=".zip"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload a ZIP file containing your GAMA project with models and libraries
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
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
                    Processing...
                  </div>
                ) : (
                  'Upload & Extract'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Select GAML Files */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                Project "{formData.projectName}" extracted successfully! 
                Select the GAML files you want to include in your project.
              </p>
            </div>

            {/* GAML Files List */}
            <div className="border border-gray-200 rounded-md max-h-96 overflow-y-auto">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <h4 className="font-medium text-gray-900">
                  Found {tempData.gamlFiles.length} GAML files
                </h4>
              </div>
              <div className="divide-y divide-gray-200">
                {tempData.gamlFiles.map((file, index) => (
                  <div key={index} className="px-4 py-3 hover:bg-gray-50">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`file-${index}`}
                        checked={selectedFiles.includes(file.relativePath)}
                        onChange={(e) => handleFileSelection(file.relativePath, e.target.checked)}
                        disabled={!file.isValid}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                      />
                      <label htmlFor={`file-${index}`} className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${file.isValid ? 'text-gray-900' : 'text-red-600'}`}>
                              {file.fileName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {file.relativePath} • {formatFileSize(file.fileSize)}
                            </p>
                            {!file.isValid && (
                              <p className="text-xs text-red-600 mt-1">
                                ❌ {file.validationError}
                              </p>
                            )}
                            
                            {/* Experiment Name Input - Show only for selected valid files */}
                            {file.isValid && selectedFiles.includes(file.relativePath) && (
                              <div className="mt-2">
                                <input
                                  type="text"
                                  placeholder="Experiment name (optional)"
                                  value={experimentNames[file.relativePath] || ''}
                                  onChange={(e) => handleExperimentNameChange(file.relativePath, e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            {file.isValid ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Invalid
                              </span>
                            )}
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Selected: {selectedFiles.length} files
            </div>

            {/* Form Actions */}
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}
              >
                Back
              </button>
              <div className="space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinalizeProject}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || selectedFiles.length === 0}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Project...
                    </div>
                  ) : (
                    'Create Project'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
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
          <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-3">
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
      </div>
    </div>
  );
};

export default ProjectUpload;