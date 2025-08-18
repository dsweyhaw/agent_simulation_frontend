import React, { useState } from 'react';
import GamlUpload from './GamlUpload';

const AddGamlButton = ({ projectId, onUploadSuccess, className = '' }) => {
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleUploadSuccess = (uploadResult) => {
    // Close modal
    setShowUploadModal(false);
    
    // Call parent callback
    if (onUploadSuccess) {
      onUploadSuccess(uploadResult);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowUploadModal(true)}
        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 ${className}`}
        title="Upload new GAML file"
      >
        <svg 
          className="w-4 h-4 mr-2" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
          />
        </svg>
        Add GAML File
      </button>

      {showUploadModal && (
        <GamlUpload
          projectId={projectId}
          onUploadSuccess={handleUploadSuccess}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </>
  );
};

export default AddGamlButton;