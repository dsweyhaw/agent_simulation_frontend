import React, { useState, useEffect } from 'react';

const TsunamiParameterInput = ({ onParametersChange, isSimulationRunning }) => {
  const [parameters, setParameters] = useState({
    locals_number: 200,
    tourists_number: 100,
    rescuers_number: 20,
    tourist_strategy: "following rescuers or locals",
    car_strategy: "always go ahead",
    tsunami_nb_segments: 30,
    tsunami_approach_time: 460,
    tsunami_speed_avg: 44.3
  });

  // Store display values as strings to allow empty input for number fields
  const [displayValues, setDisplayValues] = useState({
    locals_number: "200",
    tourists_number: "100",
    rescuers_number: "20",
    tsunami_nb_segments: "30",
    tsunami_approach_time: "460",
    tsunami_speed_avg: "44.3"
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    onParametersChange(parameters);
  }, [parameters, onParametersChange]);

  const handleNumberInputChange = (paramName, inputValue) => {
    // Allow empty string for better UX
    setDisplayValues(prev => ({ ...prev, [paramName]: inputValue }));
    
    // Parse to number only if input is not empty
    let numValue;
    if (paramName === 'tsunami_speed_avg') {
      numValue = inputValue === "" ? 0 : (parseFloat(inputValue) || 0);
    } else {
      numValue = inputValue === "" ? 0 : (parseInt(inputValue) || 0);
    }
    
    const newParameters = { ...parameters, [paramName]: numValue };
    setParameters(newParameters);
  };

  const handleNumberInputBlur = (paramName) => {
    // When user leaves the field, ensure we have a valid number
    const currentValue = displayValues[paramName];
    if (currentValue === "" || isNaN(parseFloat(currentValue))) {
      // Reset to default if empty or invalid
      const defaults = {
        locals_number: 200,
        tourists_number: 100,
        rescuers_number: 20,
        tsunami_nb_segments: 30,
        tsunami_approach_time: 460,
        tsunami_speed_avg: 44.3
      };
      setDisplayValues(prev => ({ ...prev, [paramName]: String(defaults[paramName]) }));
      const newParameters = { ...parameters, [paramName]: defaults[paramName] };
      setParameters(newParameters);
    } else {
      // Ensure display value matches parsed value (remove leading zeros)
      const numValue = paramName === 'tsunami_speed_avg' ? parseFloat(currentValue) : parseInt(currentValue);
      setDisplayValues(prev => ({ ...prev, [paramName]: String(numValue) }));
    }
  };

  const handleParameterChange = (paramName, value) => {
    const newParameters = { ...parameters, [paramName]: value };
    setParameters(newParameters);
    // Update display value for number inputs
    if (['locals_number', 'tourists_number', 'rescuers_number', 'tsunami_nb_segments', 'tsunami_approach_time', 'tsunami_speed_avg'].includes(paramName)) {
      setDisplayValues(prev => ({ ...prev, [paramName]: String(value) }));
    }
  };

  const resetToDefaults = () => {
    const defaultParams = {
      locals_number: 200,
      tourists_number: 100,
      rescuers_number: 20,
      tourist_strategy: "following rescuers or locals",
      car_strategy: "always go ahead",
      tsunami_nb_segments: 30,
      tsunami_approach_time: 460,
      tsunami_speed_avg: 44.3
    };
    setParameters(defaultParams);
    // Also update display values
    setDisplayValues({
      locals_number: "200",
      tourists_number: "100",
      rescuers_number: "20",
      tsunami_nb_segments: "30",
      tsunami_approach_time: "460",
      tsunami_speed_avg: "44.3"
    });
  };

  if (isSimulationRunning) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Current Simulation Parameters</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><span className="font-medium">Locals:</span> {parameters.locals_number}</div>
          <div><span className="font-medium">Tourists:</span> {parameters.tourists_number}</div>
          <div><span className="font-medium">Rescuers:</span> {parameters.rescuers_number}</div>
          <div><span className="font-medium">Strategy:</span> {parameters.tourist_strategy}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">🌊 Tsunami Simulation Parameters</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
          </button>
          <button
            onClick={resetToDefaults}
            className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
      
      {/* Basic Parameters */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-800 mb-3">👥 Population Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🟡 Locals
            </label>
            <input
              type="text"
              value={displayValues.locals_number}
              min="0"
              max="10000"
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty string or valid numbers
                if (value === "" || /^\d*$/.test(value)) {
                  handleNumberInputChange('locals_number', value);
                }
              }}
              onBlur={() => handleNumberInputBlur('locals_number')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Range: 0-10,000</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🟣 Tourists
            </label>
            <input
              type="text"
              value={displayValues.tourists_number}
              min="0"
              max="5000"
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty string or valid numbers
                if (value === "" || /^\d*$/.test(value)) {
                  handleNumberInputChange('tourists_number', value);
                }
              }}
              onBlur={() => handleNumberInputBlur('tourists_number')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Range: 0-5,000</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🔵 Rescuers
            </label>
            <input
              type="text"
              value={displayValues.rescuers_number}
              min="0"
              max="1000"
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty string or valid numbers
                if (value === "" || /^\d*$/.test(value)) {
                  handleNumberInputChange('rescuers_number', value);
                }
              }}
              onBlur={() => handleNumberInputBlur('rescuers_number')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Range: 0-1,000</p>
          </div>
        </div>
      </div>

      {/* Behavior Settings */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-800 mb-3">🚶 Behavior Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tourist Movement Strategy
            </label>
            <select
              value={parameters.tourist_strategy}
              onChange={(e) => handleParameterChange('tourist_strategy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="wandering">Wandering</option>
              <option value="following rescuers or locals">Following Rescuers/Locals</option>
              <option value="following crowd">Following Crowd</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Car Movement Strategy
            </label>
            <select
              value={parameters.car_strategy}
              onChange={(e) => handleParameterChange('car_strategy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="always go ahead">Always Go Ahead</option>
              <option value="go out when congestion">Exit When Congested</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Parameters */}
      {showAdvanced && (
        <div className="border-t pt-6">
          <h4 className="text-md font-medium text-gray-800 mb-3">🌊 Advanced Tsunami Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tsunami Segments
              </label>
              <input
                type="text"
                value={displayValues.tsunami_nb_segments}
                min="1"
                max="50"
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow empty string or valid numbers
                  if (value === "" || /^\d*$/.test(value)) {
                    handleNumberInputChange('tsunami_nb_segments', value);
                  }
                }}
                onBlur={() => handleNumberInputBlur('tsunami_nb_segments')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Range: 1-50. More segments = higher detail</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Approach Time (seconds)
              </label>
              <input
                type="text"
                value={displayValues.tsunami_approach_time}
                min="0"
                max="1000"
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow empty string or valid numbers
                  if (value === "" || /^\d*$/.test(value)) {
                    handleNumberInputChange('tsunami_approach_time', value);
                  }
                }}
                onBlur={() => handleNumberInputBlur('tsunami_approach_time')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Time before tsunami arrives</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Average Speed (m/s)
              </label>
              <input
                type="text"
                value={displayValues.tsunami_speed_avg}
                min="10"
                max="100"
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow empty string or valid decimal numbers
                  if (value === "" || /^\d*\.?\d*$/.test(value)) {
                    handleNumberInputChange('tsunami_speed_avg', value);
                  }
                }}
                onBlur={() => handleNumberInputBlur('tsunami_speed_avg')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Range: 10-100 m/s</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Presets */}
      <div className="mt-6 pt-4 border-t">
        <h4 className="text-sm font-medium text-gray-700 mb-2">📋 Quick Presets</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              const newParams = {
                ...parameters,
                locals_number: 100,
                tourists_number: 50,
                rescuers_number: 10
              };
              setParameters(newParams);
              setDisplayValues(prev => ({
                ...prev,
                locals_number: "100",
                tourists_number: "50",
                rescuers_number: "10"
              }));
            }}
            className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
          >
            Small Population
          </button>
          <button
            onClick={() => {
              const newParams = {
                ...parameters,
                locals_number: 500,
                tourists_number: 200,
                rescuers_number: 30
              };
              setParameters(newParams);
              setDisplayValues(prev => ({
                ...prev,
                locals_number: "500",
                tourists_number: "200",
                rescuers_number: "30"
              }));
            }}
            className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
          >
            Large Population
          </button>
          <button
            onClick={() => {
              const newParams = {
                ...parameters,
                tsunami_speed_avg: 60.0,
                tsunami_approach_time: 300
              };
              setParameters(newParams);
              setDisplayValues(prev => ({
                ...prev,
                tsunami_speed_avg: "60.0",
                tsunami_approach_time: "300"
              }));
            }}
            className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
          >
            Fast Tsunami
          </button>
        </div>
      </div>
    </div>
  );
};

export default TsunamiParameterInput;
