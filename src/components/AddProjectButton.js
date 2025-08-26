import React, { useState } from 'react';
import ProjectUpload from './ProjectUpload';

const AddProjectButton = ({ onProjectCreated, className = '' }) => {
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleProjectCreated = (projectResult) => {
    // Close modal
    setShowUploadModal(false);
    
    // Call parent callback
    if (onProjectCreated) {
      onProjectCreated(projectResult);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowUploadModal(true)}
        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ${className}`}
        title="Upload new project"
      >
        <svg 
          className="w-3 h-3 mr-1.5" 
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
        Add Project
      </button>

      {showUploadModal && (
        <ProjectUpload
          onUploadSuccess={handleProjectCreated}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </>
  );
};

export default AddProjectButton;