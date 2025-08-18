import Sidebar from "../layouts/Sidebar";
import { useEffect, useState } from "react";
import { getProjectList, getModelListByProjectId } from "../api/simulationApi";
import Project from "../components/Project";

function MainPage() {
  const [projectList, setProjectList] = useState([]);
  const [selectedProject, setSelectedProject] = useState({});
  const [modelList, setModelList] = useState([]);

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
    if (selectedProject.id) {
      const modelArray = [];
      await getModelListByProjectId(selectedProject.id).then((response) => {
        response.data.data.forEach((model) => {
          modelArray.push({ id: model.id, name: model.name });
        });
      });
      setModelList(modelArray);
    }
  };

  const handleModelUpload = (uploadResult) => {
    // Refresh the model list after successful upload
    getModel();
    console.log('Model uploaded successfully:', uploadResult);
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
      />
      {selectedProject.id && <Project selectedProject={selectedProject} />}
    </div>
  );
}

export default MainPage;
