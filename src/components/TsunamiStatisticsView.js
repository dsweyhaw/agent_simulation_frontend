import React, { useState } from "react";
import TsunamiOverviewStats from "./TsunamiOverviewStats";
import TsunamiDeathStats from "./TsunamiDeathStats";

// Main component for Tsunami statistics
const TsunamiStatisticsView = ({ data }) => {
  const [viewMode, setViewMode] = useState("overview");

  const ViewControls = () => (
    <div className="flex gap-4 mb-6">
      <button
        onClick={() => setViewMode("overview")}
        className={`px-4 py-2 rounded-lg transition-colors ${
          viewMode === "overview"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        🌊 Population Status
      </button>
      <button
        onClick={() => setViewMode("death")}
        className={`px-4 py-2 rounded-lg transition-colors ${
          viewMode === "death"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        💀 Death Percentage
      </button>
    </div>
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6">🌊 Tsunami Simulation Statistics</h2>
      <ViewControls />

      {viewMode === "overview" && <TsunamiOverviewStats data={data} />}
      {viewMode === "death" && <TsunamiDeathStats data={data} />}
    </div>
  );
};

export default TsunamiStatisticsView;

