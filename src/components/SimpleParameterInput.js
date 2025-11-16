import React, { useState, useEffect } from 'react';

const SimpleParameterInput = ({ onParametersChange, isSimulationRunning }) => {
  const [parameters, setParameters] = useState({
    "Number of locals": 200,
    "Number of tourists": 100,
    "Number of rescuers": 20,
    "Tourist Movement Strategy": "following rescuers or locals",
  });

  // Store display values as strings to allow empty input
  const [displayValues, setDisplayValues] = useState({
    "Number of locals": "200",
    "Number of tourists": "100",
    "Number of rescuers": "20",
  });

  // Send initial parameters when component mounts
  useEffect(() => {
    console.log("=== INITIAL PARAMETERS ===");
    console.log("Setting initial parameters:", parameters);
    if (onParametersChange) {
      onParametersChange(parameters);
    }
  }, [onParametersChange]); // Only run when onParametersChange changes

  const handleNumberInputChange = (paramName, inputValue) => {
    // Allow empty string for better UX
    setDisplayValues(prev => ({ ...prev, [paramName]: inputValue }));
    
    // Parse to number only if input is not empty
    const numValue = inputValue === "" ? 0 : (parseInt(inputValue) || 0);
    const newParameters = { ...parameters, [paramName]: numValue };
    setParameters(newParameters);
    
    console.log("=== PARAMETER CHANGE DEBUG ===");
    console.log("Parameter changed:", paramName, "->", inputValue, "parsed as:", numValue);
    console.log("New parameters:", newParameters);
    console.log("onParametersChange callback exists:", !!onParametersChange);
    if (onParametersChange) {
      onParametersChange(newParameters);
    }
  };

  const handleNumberInputBlur = (paramName) => {
    // When user leaves the field, ensure we have a valid number
    const currentValue = displayValues[paramName];
    if (currentValue === "" || isNaN(parseInt(currentValue))) {
      // Reset to default value if empty or invalid
      const defaults = {
        "Number of locals": 200,
        "Number of tourists": 100,
        "Number of rescuers": 20
      };
      const defaultValue = defaults[paramName] || 0;
      setDisplayValues(prev => ({ ...prev, [paramName]: String(defaultValue) }));
      const newParameters = { ...parameters, [paramName]: defaultValue };
      setParameters(newParameters);
      if (onParametersChange) {
        onParametersChange(newParameters);
      }
    } else {
      // Ensure display value matches parsed value (remove leading zeros)
      const numValue = parseInt(currentValue);
      setDisplayValues(prev => ({ ...prev, [paramName]: String(numValue) }));
    }
  };

  const handleParameterChange = (paramName, value) => {
    const newParameters = { ...parameters, [paramName]: value };
    setParameters(newParameters);
    // Update display value for number inputs
    if (paramName === "Number of locals" || paramName === "Number of tourists" || paramName === "Number of rescuers") {
      setDisplayValues(prev => ({ ...prev, [paramName]: String(value) }));
    }
    console.log("=== PARAMETER CHANGE DEBUG ===");
    console.log("Parameter changed:", paramName, "->", value);
    console.log("New parameters:", newParameters);
    console.log("onParametersChange callback exists:", !!onParametersChange);
    if (onParametersChange) {
      onParametersChange(newParameters);
    }
  };

  return (
    <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 mb-4">
      <h3 className="text-lg font-bold text-blue-800 mb-4">
        🌊 Tsunami Simulation Parameters
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🟡 Number of Locals
          </label>
          <input
            type="text"
            value={displayValues["Number of locals"]}
            min="0"
            max="10000"
            onChange={(e) => {
              const value = e.target.value;
              // Allow empty string or valid numbers
              if (value === "" || /^\d*$/.test(value)) {
                handleNumberInputChange('Number of locals', value);
              }
            }}
            onBlur={() => handleNumberInputBlur('Number of locals')}
            disabled={isSimulationRunning}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">Range: 0-10,000</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🟣 Number of Tourists
          </label>
          <input
            type="text"
            value={displayValues["Number of tourists"]}
            min="0"
            max="5000"
            onChange={(e) => {
              const value = e.target.value;
              // Allow empty string or valid numbers
              if (value === "" || /^\d*$/.test(value)) {
                handleNumberInputChange('Number of tourists', value);
              }
            }}
            onBlur={() => handleNumberInputBlur('Number of tourists')}
            disabled={isSimulationRunning}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">Range: 0-5,000</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🔵 Number of Rescuers
          </label>
          <input
            type="text"
            value={displayValues["Number of rescuers"]}
            min="0"
            max="1000"
            onChange={(e) => {
              const value = e.target.value;
              // Allow empty string or valid numbers
              if (value === "" || /^\d*$/.test(value)) {
                handleNumberInputChange('Number of rescuers', value);
              }
            }}
            onBlur={() => handleNumberInputBlur('Number of rescuers')}
            disabled={isSimulationRunning}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">Range: 0-1,000</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🚶 Tourist Movement Strategy
          </label>
          <select
            value={parameters["Tourist Movement Strategy"]}
            onChange={(e) => handleParameterChange('Tourist Movement Strategy', e.target.value)}
            disabled={isSimulationRunning}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="wandering">Wandering</option>
            <option value="following rescuers or locals">Following Rescuers/Locals</option>
            <option value="following crowd">Following Crowd</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">How tourists behave during evacuation</p>
        </div>
      </div>

      {/* Quick Strategy Presets */}
      {!isSimulationRunning && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">🎯 Quick Strategy Presets</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleParameterChange('Tourist Movement Strategy', 'wandering')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                parameters["Tourist Movement Strategy"] === 'wandering' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
            >
              🚶 Wandering
            </button>
            <button
              onClick={() => handleParameterChange('Tourist Movement Strategy', 'following rescuers or locals')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                parameters["Tourist Movement Strategy"] === 'following rescuers or locals' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
            >
              🚒 Following Rescuers or locals
            </button>
            <button
              onClick={() => handleParameterChange('Tourist Movement Strategy', 'following crowd')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                parameters["Tourist Movement Strategy"] === 'following crowd' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
            >
              👥 Following Crowd
            </button>
          </div>
        </div>
      )}

      {isSimulationRunning && (
        <div className="mt-4 p-3 bg-green-100 rounded text-green-800">
          <div className="font-semibold mb-2">✅ Simulation running with these parameters:</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div><strong>Locals:</strong> {parameters["Number of locals"]}</div>
            <div><strong>Tourists:</strong> {parameters["Number of tourists"]}</div>
            <div><strong>Rescuers:</strong> {parameters["Number of rescuers"]}</div>
            <div><strong>Strategy:</strong> {parameters["Tourist Movement Strategy"]}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleParameterInput;
