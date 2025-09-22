import React, { useState, useEffect } from 'react';
import { getExperimentParameters } from '../api/simulationApi';

const ParameterInput = ({ selectedProject, selectedModel, selectedExperiment, onParametersChange }) => {
  const [parameters, setParameters] = useState({});
  const [parameterValues, setParameterValues] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedProject && selectedModel && selectedExperiment) {
      loadParameters();
    }
  }, [selectedProject, selectedModel, selectedExperiment]);

  const loadParameters = async () => {
    setLoading(true);
    try {
      const response = await getExperimentParameters(
        selectedProject.id,
        selectedModel.id,
        selectedExperiment.id
      );
      setParameters(response.data.data);
      
      // Initialize with default values
      const defaultValues = {};
      Object.entries(response.data.data).forEach(([key, config]) => {
        defaultValues[key] = config.default;
      });
      setParameterValues(defaultValues);
      onParametersChange(defaultValues);
    } catch (error) {
      console.error('Failed to load parameters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleParameterChange = (paramName, value) => {
    const newValues = { ...parameterValues, [paramName]: value };
    setParameterValues(newValues);
    onParametersChange(newValues);
  };

  const renderParameterInput = (paramName, config) => {
    const value = parameterValues[paramName] || config.default;

    if (config.type === 'string' && config.options) {
      // Dropdown for string parameters with options
      return (
        <select
          value={value}
          onChange={(e) => handleParameterChange(paramName, e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          {config.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    } else if (config.type === 'int' || config.type === 'float') {
      // Number input for int/float parameters
      return (
        <input
          type="number"
          value={value}
          min={config.min}
          max={config.max}
          step={config.type === 'float' ? '0.1' : '1'}
          onChange={(e) => handleParameterChange(paramName, config.type === 'int' ? parseInt(e.target.value) : parseFloat(e.target.value))}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      );
    } else {
      // Text input for other parameters
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => handleParameterChange(paramName, e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      );
    }
  };

  if (!selectedProject || !selectedModel || !selectedExperiment) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Simulation Parameters</h3>
        <div className="text-center">Loading parameters...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow border">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Simulation Parameters</h3>
      
      {Object.keys(parameters).length === 0 ? (
        <div className="text-gray-500">No parameters available for this experiment.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(parameters).map(([paramName, config]) => (
            <div key={paramName}>
              <label className="block text-sm font-medium text-gray-700">
                {config.description || paramName}
              </label>
              {renderParameterInput(paramName, config)}
              {config.min !== undefined && config.max !== undefined && (
                <p className="mt-1 text-xs text-gray-500">
                  Range: {config.min} - {config.max}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParameterInput;
