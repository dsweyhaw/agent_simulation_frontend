import Sidebar from "../layouts/Sidebar";
import { useEffect, useState } from "react";
import { getProjectList, getModelListByProjectId } from "../api/simulationApi";
import Project from "../components/Project";

function MainPage() {
  const [projectList, setProjectList] = useState([]);
  const [selectedProject, setSelectedProject] = useState({});
  const [modelList, setModelList] = useState([]);
  const [modelUploadTrigger, setModelUploadTrigger] = useState(0);

  const getProject = async () => {
    const projectArray = [];
    await getProjectList().then((response) => {
      response.data.data.forEach((project) => {
        projectArray.push({ id: project.id, name: project.name });
      });
    });
    setProjectList(projectArray);
  };

  const onSelectedProject = (e) => {
    setModelList([]);
    setSelectedProject(projectList[e.target.id]);
  };

  const getModel = async () => {
    console.log('=== MainPage: getModel called ===');
    console.log('Selected Project ID:', selectedProject.id);
    
    if (selectedProject.id) {
      const modelArray = [];
      await getModelListByProjectId(selectedProject.id).then((response) => {
        console.log('API Response for models:', response.data);
        response.data.data.forEach((model) => {
          modelArray.push({ id: model.id, name: model.name });
        });
      });
      console.log('Setting model list:', modelArray);
      setModelList(modelArray);
    } else {
      console.log('No selected project, skipping model fetch');
    }
  };

  const handleModelUpload = (uploadResult) => {
    console.log('=== MainPage: handleModelUpload called ===');
    console.log('Upload Result:', uploadResult);
    console.log('Selected Project:', selectedProject);
    
    // Refresh the model list after successful upload with a small delay
    // to ensure the database has been updated
    setTimeout(() => {
      console.log('Refreshing model list after delay...');
      getModel();
    }, 500);
    
    // Trigger refresh for Project component's model options
    setModelUploadTrigger(prev => prev + 1);
    
    console.log('Model uploaded successfully:', uploadResult);
  };

  const handleProjectCreated = (projectResult) => {
    console.log('=== MainPage: handleProjectCreated called ===');
    console.log('Project Result:', projectResult);
    
    // Refresh the project list after successful creation with a small delay
    setTimeout(() => {
      console.log('Refreshing project list after delay...');
      getProject();
    }, 500);
    
    console.log('Project created successfully:', projectResult);
  };

  const handleProjectDeleted = () => {
    console.log('=== MainPage: handleProjectDeleted called ===');
    
    // Clear selected project if it was deleted
    setSelectedProject({});
    setModelList([]);
    
    // Refresh the project list after deletion
    setTimeout(() => {
      console.log('Refreshing project list after project deletion...');
      getProject();
    }, 500);
    
    console.log('Project deleted successfully');
  };

  const handleModelDeleted = () => {
    console.log('=== MainPage: handleModelDeleted called ===');
    
    // Refresh the model list after successful deletion
    setTimeout(() => {
      console.log('Refreshing model list after model deletion...');
      getModel();
    }, 500);
    
    // Trigger refresh for Project component's model options
    setModelUploadTrigger(prev => prev + 1);
    
    console.log('Model deleted successfully');
  };

  useEffect(() => {
    getProject();
  }, []);

  useEffect(() => {
    getModel();
  }, [selectedProject]);

  return (
    <div>
      <Sidebar
        projectList={projectList}
        selectedProject={selectedProject}
        onSelectedProject={onSelectedProject}
        modelList={modelList}
        onModelUpload={handleModelUpload}
        onProjectCreated={handleProjectCreated}
        onProjectDeleted={handleProjectDeleted}
        onModelDeleted={handleModelDeleted}
      />
      {selectedProject.id && <Project selectedProject={selectedProject} modelUploadTrigger={modelUploadTrigger} />}
    </div>
  );
}

export default MainPage;
