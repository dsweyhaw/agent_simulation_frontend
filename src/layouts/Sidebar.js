import { FolderIcon, ChevronDownIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import AddGamlButton from "../components/AddGamlButton";
import AddProjectButton from "../components/AddProjectButton";
import ConfirmDialog from "../components/ConfirmDialog";
import { deleteProject, deleteModel } from "../api/simulationApi";

function Sidebar({
  projectList,
  selectedProject,
  onSelectedProject,
  modelList,
  onModelUpload,
  onProjectCreated,
  onProjectDeleted,
  onModelDeleted,
}) {
  const [expandedProject, setExpandedProject] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    type: '', // 'project' or 'model'
    item: null,
    title: '',
    message: ''
  });

  useEffect(() => {
    if (selectedProject.id) {
      setExpandedProject(selectedProject.id);
    }
  }, [selectedProject.id]);

  const toggleModels = (projectId, event) => {
    event.stopPropagation();
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  const handleProjectClick = (e) => {
    const projectId = projectList[e.target.id].id;

    if (selectedProject.id !== projectId) {
      onSelectedProject(e);
    }

    if (selectedProject.id === projectId) {
      setExpandedProject(expandedProject === projectId ? null : projectId);
    } else {
      setExpandedProject(projectId);
    }
  };

  const formatModelName = (name) => {
    return name.endsWith(".gaml") ? name : `${name}.gaml`;
  };

  const handleDeleteProject = (project, event) => {
    event.stopPropagation();
    setDeleteDialog({
      isOpen: true,
      type: 'project',
      item: project,
      title: 'Delete Project',
      message: `Are you sure you want to delete "${project.name}"? This action cannot be undone and will delete all models in this project.`
    });
  };

  const handleDeleteModel = (model, event) => {
    event.stopPropagation();
    setDeleteDialog({
      isOpen: true,
      type: 'model',
      item: model,
      title: 'Delete Model',
      message: `Are you sure you want to delete "${formatModelName(model.name)}"? This action cannot be undone.`
    });
  };

  const confirmDelete = async () => {
    const { type, item } = deleteDialog;
    
    try {
      if (type === 'project') {
        await deleteProject(item.id);
        console.log('Project deleted successfully:', item.name);
        onProjectDeleted && onProjectDeleted();
      } else if (type === 'model') {
        await deleteModel(item.id, selectedProject.id);
        console.log('Model deleted successfully:', item.name);
        onModelDeleted && onModelDeleted();
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      // You could add a toast notification here for error handling
    }
    
    setDeleteDialog({ isOpen: false, type: '', item: null, title: '', message: '' });
  };

  const cancelDelete = () => {
    setDeleteDialog({ isOpen: false, type: '', item: null, title: '', message: '' });
  };

  return (
    <aside
      className="fixed top-0 left-0 z-40 w-80 h-screen bg-gray-50 transition-transform -translate-x-full sm:translate-x-0 flex-col"
      aria-label="Sidebar"
    >
      <div className="flex px-3 py-4 items-center gap-2 justify-center text-center">
        <img src="/favicon.ico" className="size-10" alt="logo" />
        <h1 className="font-semibold text-lg">Pig Farm Simulation</h1>
      </div>

      <div className="mx-4 mb-2">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Projects</span>
          <AddProjectButton 
            onProjectCreated={onProjectCreated}
            className="ml-2"
          />
        </div>
      </div>

      <div className="h-full overflow-y-auto">
        <ul className="mx-4 font-medium space-y-2">
          {Array.from(projectList).map((project, index) => {
            const isSelected = selectedProject.id === project.id;
            const isExpanded = expandedProject === project.id;

            return (
              <div key={project.id}>
                <li
                  className={`flex cursor-pointer items-center p-2 gap-4 text-gray-900 rounded-lg ${
                    isSelected ? "bg-blue-100" : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  <div
                    className="flex-1 flex items-center gap-4"
                    onClick={handleProjectClick}
                    id={index}
                    value={project.id}
                  >
                    <FolderIcon className="flex-shrink-0 size-5 text-gray-500" />
                    {project.name}
                  </div>

                  <div className="flex items-center gap-1">
                    <TrashIcon 
                      className="size-4 text-red-500 hover:text-red-700 cursor-pointer"
                      onClick={(e) => handleDeleteProject(project, e)}
                      title="Delete project"
                    />
                    
                    {isSelected && (
                      <ChevronDownIcon
                        className={`size-5 text-gray-500 cursor-pointer transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        onClick={(e) => toggleModels(project.id, e)}
                      />
                    )}
                  </div>
                </li>

                {isSelected && isExpanded && (
                  <div className="ml-9 mr-4 mt-2 space-y-1">
                    {/* Add GAML File Button */}
                    <div className="mb-3">
                      <AddGamlButton
                        projectId={selectedProject.id}
                        onUploadSuccess={onModelUpload}
                        className="w-full text-xs py-1.5 px-3"
                      />
                    </div>
                    
                    {/* Models List */}
                    <ul className="space-y-1 overflow-y-auto max-h-80 transition-all duration-200">
                      {modelList.map((model) => (
                        <li
                          key={model.id}
                          className="flex items-center justify-between p-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          <span>{formatModelName(model.name)}</span>
                          <TrashIcon 
                            className="size-4 text-red-500 hover:text-red-700 cursor-pointer ml-2"
                            onClick={(e) => handleDeleteModel(model, e)}
                            title="Delete model"
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </ul>
      </div>
      
      {/* Confirmation Dialog */}
      <ConfirmDialog 
        isOpen={deleteDialog.isOpen}
        title={deleteDialog.title}
        message={deleteDialog.message}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
    </aside>
  );
}

export default Sidebar;
