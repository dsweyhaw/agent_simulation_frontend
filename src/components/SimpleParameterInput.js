import React, { useState, useEffect } from 'react';

const SimpleParameterInput = ({ onParametersChange, isSimulationRunning }) => {
  const [parameters, setParameters] = useState({
    "Number of locals": 200,
    "Number of tourists": 100,
    "Number of rescuers": 20,
    "Tourist Movement Strategy": "following rescuers or locals",
  });

  // Send initial parameters when component mounts
  useEffect(() => {
    console.log("=== INITIAL PARAMETERS ===");
    console.log("Setting initial parameters:", parameters);
    if (onParametersChange) {
      onParametersChange(parameters);
    }
  }, [onParametersChange]); // Only run when onParametersChange changes

  const handleParameterChange = (paramName, value) => {
    const newParameters = { ...parameters, [paramName]: value };
    setParameters(newParameters);
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
            type="number"
            value={parameters["Number of locals"]}
            min="0"
            max="10000"
            onChange={(e) => handleParameterChange('Number of locals', parseInt(e.target.value) || 0)}
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
            type="number"
            value={parameters["Number of tourists"]}
            min="0"
            max="5000"
            onChange={(e) => handleParameterChange('Number of tourists', parseInt(e.target.value) || 0)}
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
            type="number"
            value={parameters["Number of rescuers"]}
            min="0"
            max="1000"
            onChange={(e) => handleParameterChange('Number of rescuers', parseInt(e.target.value) || 0)}
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
