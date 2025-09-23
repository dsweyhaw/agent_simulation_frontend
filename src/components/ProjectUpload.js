import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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
      
      // Validate file size (100MB = 100 * 1024 * 1024 bytes)
      const maxSizeBytes = 100 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        setError(`File size (${formatFileSize(file.size)}) exceeds the maximum limit of 100MB. Please select a smaller file.`);
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

  const handleSelectAll = () => {
    const validFiles = tempData.gamlFiles
      .filter(isValidFile)
      .map(file => file.relativePath);
    setSelectedFiles(validFiles);
  };

  const handleUnselectAll = () => {
    setSelectedFiles([]);
  };

  const handleUploadZip = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.zipFile) {
      setError('Please select a ZIP file');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await uploadProjectZip("auto-detect", formData.zipFile);

      if (response.data.status === 'success') {
        const { tempDirId, gamlFiles, detectedProjectName } = response.data.data;
        setTempData({ tempDirId, gamlFiles });
        
        // Update project name with detected name if available
        if (detectedProjectName) {
          setFormData(prev => ({ ...prev, projectName: detectedProjectName }));
        }
        
        // Pre-select valid GAML files
        // Note: Backend sends validationError as null for valid files, and isValid might be undefined
        const validFiles = gamlFiles
          .filter(isValidFile)
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

  // Helper function to determine if a file is valid
  const isValidFile = (file) => {
    return file.isValid === true || (file.isValid === undefined && file.validationError === null);
  };

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-6xl mx-4 max-h-[95vh] overflow-y-auto" 
        style={{
          minWidth: '900px',
          minHeight: '700px',
          maxWidth: '90vw',
          maxHeight: '95vh',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'auto'
        }}
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">
            {step === 1 ? 'Upload Project ZIP' : 'Select GAML Files'}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
            disabled={loading}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step 1: Upload ZIP */}
        {step === 1 && (
          <form onSubmit={handleUploadZip} className="space-y-6">
            {/* Auto-detected Project Name Display */}
            {formData.projectName && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Detected Project Name:</span> {formData.projectName}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Project name will be automatically detected from ZIP structure
                </p>
              </div>
            )}

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
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                Project "{formData.projectName}" extracted successfully! 
                Select the GAML files you want to include in your project.
              </p>
            </div>

            {/* GAML Files List */}
            <div className="border border-gray-200 rounded-md max-h-[500px] overflow-y-auto">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium text-gray-900">
                    Found {tempData.gamlFiles.length} GAML files
                  </h4>
                  <div className="flex items-center space-x-4">
                    <p className="text-sm text-gray-600">
                      Selected: {selectedFiles.length} files
                    </p>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        disabled={loading}
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={handleUnselectAll}
                        className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                        disabled={loading}
                      >
                        Unselect All
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  All files are shown as valid. Validation will occur when you create the project.
                </p>
              </div>
              <div className="divide-y divide-gray-200">
                {tempData.gamlFiles.map((file, index) => (
                  <div key={index} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        id={`file-${index}`}
                        checked={selectedFiles.includes(file.relativePath)}
                        onChange={(e) => handleFileSelection(file.relativePath, e.target.checked)}
                        disabled={!isValidFile(file)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 mt-1"
                      />
                      <label htmlFor={`file-${index}`} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-base font-medium text-gray-900">
                              {file.fileName}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {file.relativePath} • {formatFileSize(file.fileSize)}
                            </p>
                            
                            {/* Experiment Name Input - Show only for selected files */}
                            {selectedFiles.includes(file.relativePath) && (
                              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <label className="block text-xs font-medium text-blue-800 mb-1">
                                  Experiment Name (Optional)
                                </label>
                                <input
                                  type="text"
                                  placeholder="Enter experiment name..."
                                  value={experimentNames[file.relativePath] || ''}
                                  onChange={(e) => handleExperimentNameChange(file.relativePath, e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
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

  return createPortal(modalContent, document.body);
};

export default ProjectUpload;