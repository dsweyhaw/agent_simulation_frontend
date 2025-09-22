import React from "react";

const SimulationParameterDisplay = ({ parameters, isTsunamiProject = false, compact = false }) => {
  if (!parameters || Object.keys(parameters).length === 0) {
    return null;
  }

  const formatParameterName = (key) => {
    const nameMap = {
      "Number of locals": "🟡 Locals",
      "Number of tourists": "🟣 Tourists", 
      "Number of rescuers": "🔵 Rescuers",
      "Tourist Movement Strategy": "🚶 Tourist Strategy",
      "locals_number": "🟡 Locals",
      "tourists_number": "🟣 Tourists",
      "rescuers_number": "🔵 Rescuers",
      "tourist_strategy": "🚶 Tourist Strategy",
      "car_strategy": "🚗 Car Strategy",
      "tsunami_nb_segments": "🌊 Tsunami Segments",
      "tsunami_approach_time": "⏱️ Approach Time",
      "tsunami_speed_avg": "💨 Tsunami Speed"
    };
    return nameMap[key] || key;
  };

  const formatParameterValue = (value) => {
    if (typeof value === 'string') {
      // Format strategy names
      if (value === "following rescuers or locals") return "Following Rescuers/Locals";
      if (value === "following crowd") return "Following Crowd";
      if (value === "wandering") return "Wandering";
      if (value === "always go ahead") return "Always Go Ahead";
      if (value === "go out when congestion") return "Go Out When Congestion";
    }
    return value;
  };

  if (compact) {
    return (
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <h5 className="text-sm font-semibold text-blue-800 mb-2">
          {isTsunamiProject ? "🌊 Simulation Parameters" : "🐷 Simulation Parameters"}
        </h5>
        <div className="flex flex-wrap gap-2">
          {Object.entries(parameters).map(([key, value]) => (
            <span
              key={key}
              className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
            >
              {formatParameterName(key)}: {formatParameterValue(value)}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h4 className="text-lg font-semibold text-gray-800 mb-3">
        {isTsunamiProject ? "🌊 Tsunami Parameters" : "🐷 Simulation Parameters"}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(parameters).map(([key, value]) => (
          <div key={key} className="bg-white p-3 rounded-lg border border-gray-100">
            <div className="text-sm font-medium text-gray-600 mb-1">
              {formatParameterName(key)}
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {formatParameterValue(value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimulationParameterDisplay;

