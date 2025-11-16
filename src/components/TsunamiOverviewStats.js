import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const TsunamiOverviewStats = ({ data }) => {
  // Debug: Log the data structure
  console.log("🌊 TsunamiOverviewStats received data:", data);

  // Process data to extract population statistics
  const processedData = useMemo(() => {
    console.log("🔍 Processing Tsunami data:", data);
    if (!data || !data.steps) {
      console.log("❌ No data or steps found");
      return [];
    }
    console.log("✅ Found", data.steps.length, "steps");

    // Log available variable names from the first step for debugging
    if (data.steps.length > 0) {
      const firstStepVars = data.steps[0].variables || {};
      const availableVarNames = Object.keys(firstStepVars);
      console.log("📋 Available variable names in API response:", availableVarNames);
    }

    return data.steps.map((step) => {
      const stepId = parseInt(step.id);
      const vars = step.variables || {};

      // Helper function to find variable value with multiple possible names
      const getVarValue = (possibleNames) => {
        for (const name of possibleNames) {
          const value = vars[name]?.value;
          if (value !== undefined && value !== null) {
            return parseInt(value) || 0;
          }
        }
        return 0;
      };

      // Extract population data with fallback variable names
      const safeLocals = getVarValue(['Safe locals', 'safe locals', 'Safe Locals', 'safeLocals']);
      const deadLocals = getVarValue(['Dead locals', 'dead locals', 'Dead Locals', 'deadLocals', 'Casualties locals', 'casualties locals']);
      const dangerLocals = getVarValue(['In danger locals', 'in danger locals', 'In Danger Locals', 'inDangerLocals', 'Danger locals', 'danger locals']);

      const safeTourists = getVarValue(['Safe tourists', 'safe tourists', 'Safe Tourists', 'safeTourists']);
      const deadTourists = getVarValue(['Dead tourists', 'dead tourists', 'Dead Tourists', 'deadTourists', 'Casualties tourists', 'casualties tourists']);
      const dangerTourists = getVarValue(['In danger tourists', 'in danger tourists', 'In Danger Tourists', 'inDangerTourists', 'Danger tourists', 'danger tourists']);

      const safeRescuers = getVarValue(['Safe rescuers', 'safe rescuers', 'Safe Rescuers', 'safeRescuers']);
      const deadRescuers = getVarValue(['Dead rescuers', 'dead rescuers', 'Dead Rescuers', 'deadRescuers', 'Casualties rescuers', 'casualties rescuers']);
      const dangerRescuers = getVarValue(['In danger rescuers', 'in danger rescuers', 'In Danger Rescuers', 'inDangerRescuers', 'Danger rescuers', 'danger rescuers']);

      const safeCars = getVarValue(['Safe cars', 'safe cars', 'Safe Cars', 'safeCars']);
      const deadCars = getVarValue(['Dead cars', 'dead cars', 'Dead Cars', 'deadCars', 'Casualties cars', 'casualties cars']);

      const safeBoats = getVarValue(['Safe boats', 'safe boats', 'Safe Boats', 'safeBoats']);
      const deadBoats = getVarValue(['Dead boats', 'dead boats', 'Dead Boats', 'deadBoats', 'Casualties boats', 'casualties boats']);

      // Calculate totals
      const totalSafe = safeLocals + safeTourists + safeRescuers + safeCars + safeBoats;
      const totalDead = deadLocals + deadTourists + deadRescuers + deadCars + deadBoats;
      const totalDanger = dangerLocals + dangerTourists + dangerRescuers;
      const totalPopulation = totalSafe + totalDead + totalDanger;

      return {
        step: stepId,
        // People categories
        safeLocals,
        deadLocals,
        dangerLocals,
        safeTourists,
        deadTourists,
        dangerTourists,
        safeRescuers,
        deadRescuers,
        dangerRescuers,
        // Vehicles
        safeCars,
        deadCars,
        safeBoats,
        deadBoats,
        // Totals
        totalSafe,
        totalDead,
        totalDanger,
        totalPopulation,
        // Percentages
        safePercentage: totalPopulation > 0 ? (totalSafe / totalPopulation * 100).toFixed(1) : 0,
        deadPercentage: totalPopulation > 0 ? (totalDead / totalPopulation * 100).toFixed(1) : 0,
        dangerPercentage: totalPopulation > 0 ? (totalDanger / totalPopulation * 100).toFixed(1) : 0,
      };
    }).filter(item => item.totalPopulation > 0); // Filter out steps with no data
  }, [data]);

  // Get latest statistics (use the last step with data)
  const latestStats = processedData.length > 0 ? processedData[processedData.length - 1] : null;
  
  // Debug: Log the latest stats to verify they match backend logs
  if (latestStats) {
    console.log("📊 Latest Statistics from Frontend:", {
      locals: {
        safe: latestStats.safeLocals,
        dead: latestStats.deadLocals,
        danger: latestStats.dangerLocals,
        total: latestStats.safeLocals + latestStats.deadLocals + latestStats.dangerLocals
      },
      tourists: {
        safe: latestStats.safeTourists,
        dead: latestStats.deadTourists,
        danger: latestStats.dangerTourists,
        total: latestStats.safeTourists + latestStats.deadTourists + latestStats.dangerTourists
      },
      rescuers: {
        safe: latestStats.safeRescuers,
        dead: latestStats.deadRescuers,
        danger: latestStats.dangerRescuers,
        total: latestStats.safeRescuers + latestStats.deadRescuers + latestStats.dangerRescuers
      },
      cars: {
        safe: latestStats.safeCars,
        dead: latestStats.deadCars,
        total: latestStats.safeCars + latestStats.deadCars
      },
      totals: {
        safe: latestStats.totalSafe,
        dead: latestStats.totalDead,
        danger: latestStats.totalDanger,
        population: latestStats.totalPopulation
      }
    });
  }

  // Prepare pie chart data for population status
  const populationStatusData = latestStats ? [
    { name: "🟢 Safe", value: latestStats.totalSafe, color: "#22C55E" },
    { name: "🔴 Dead", value: latestStats.totalDead, color: "#EF4444" },
    { name: "🟡 In Danger", value: latestStats.totalDanger, color: "#F59E0B" },
  ] : [];

  // Prepare pie chart data for population by type
  const populationByTypeData = latestStats ? [
    { name: "🟡 Locals", value: latestStats.safeLocals + latestStats.deadLocals + latestStats.dangerLocals, color: "#FCD34D" },
    { name: "🟣 Tourists", value: latestStats.safeTourists + latestStats.deadTourists + latestStats.dangerTourists, color: "#A855F7" },
    { name: "🔵 Rescuers", value: latestStats.safeRescuers + latestStats.deadRescuers + latestStats.dangerRescuers, color: "#3B82F6" },
    { name: "🚗 Cars", value: latestStats.safeCars + latestStats.deadCars, color: "#8B5CF6" },
    { name: "🚤 Boats", value: latestStats.safeBoats + latestStats.deadBoats, color: "#06B6D4" },
  ].filter(item => item.value > 0) : [];

  if (!processedData.length) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500 text-lg">
          📊 No population data available for this simulation
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
          <div className="text-green-800 text-lg font-semibold mb-2">🟢 Safe Population</div>
          <div className="text-3xl font-bold text-green-900">{latestStats?.totalSafe || 0}</div>
          <div className="text-green-600 text-sm">{latestStats?.safePercentage || 0}% of total</div>
        </div>

        <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
          <div className="text-red-800 text-lg font-semibold mb-2">🔴 Casualties</div>
          <div className="text-3xl font-bold text-red-900">{latestStats?.totalDead || 0}</div>
          <div className="text-red-600 text-sm">{latestStats?.deadPercentage || 0}% of total</div>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200">
          <div className="text-yellow-800 text-lg font-semibold mb-2">🟡 In Danger</div>
          <div className="text-3xl font-bold text-yellow-900">{latestStats?.totalDanger || 0}</div>
          <div className="text-yellow-600 text-sm">{latestStats?.dangerPercentage || 0}% of total</div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
          <div className="text-blue-800 text-lg font-semibold mb-2">👥 Total Population</div>
          <div className="text-3xl font-bold text-blue-900">{latestStats?.totalPopulation || 0}</div>
          <div className="text-blue-600 text-sm">All entities</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Population Status Over Time */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">📈 Population Status Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="step" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="totalSafe" stroke="#22C55E" strokeWidth={3} name="Safe" />
              <Line type="monotone" dataKey="totalDead" stroke="#EF4444" strokeWidth={3} name="Dead" />
              <Line type="monotone" dataKey="totalDanger" stroke="#F59E0B" strokeWidth={3} name="In Danger" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Current Population Status Distribution */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">🎯 Current Population Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={populationStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {populationStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Population by Type */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">👥 Population by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={populationByTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Population Distribution Pie */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">🌊 Population Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={populationByTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {populationByTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed breakdown */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">📋 Detailed Population Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Locals */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="text-lg font-semibold text-yellow-800 mb-3">🟡 Locals</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-green-600">🟢 Safe:</span>
                <span className="font-semibold">{latestStats?.safeLocals || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">🔴 Dead:</span>
                <span className="font-semibold">{latestStats?.deadLocals || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600">🟡 In Danger:</span>
                <span className="font-semibold">{latestStats?.dangerLocals || 0}</span>
              </div>
            </div>
          </div>

          {/* Tourists */}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="text-lg font-semibold text-purple-800 mb-3">🟣 Tourists</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-green-600">🟢 Safe:</span>
                <span className="font-semibold">{latestStats?.safeTourists || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">🔴 Dead:</span>
                <span className="font-semibold">{latestStats?.deadTourists || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600">🟡 In Danger:</span>
                <span className="font-semibold">{latestStats?.dangerTourists || 0}</span>
              </div>
            </div>
          </div>

          {/* Rescuers */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="text-lg font-semibold text-blue-800 mb-3">🔵 Rescuers</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-green-600">🟢 Safe:</span>
                <span className="font-semibold">{latestStats?.safeRescuers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">🔴 Dead:</span>
                <span className="font-semibold">{latestStats?.deadRescuers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600">🟡 In Danger:</span>
                <span className="font-semibold">{latestStats?.dangerRescuers || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicles */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <h4 className="text-lg font-semibold text-indigo-800 mb-3">🚗 Cars</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-green-600">🟢 Safe:</span>
                <span className="font-semibold">{latestStats?.safeCars || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">🔴 Destroyed:</span>
                <span className="font-semibold">{latestStats?.deadCars || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
            <h4 className="text-lg font-semibold text-cyan-800 mb-3">🚤 Boats</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-green-600">🟢 Safe:</span>
                <span className="font-semibold">{latestStats?.safeBoats || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600">🔴 Destroyed:</span>
                <span className="font-semibold">{latestStats?.deadBoats || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TsunamiOverviewStats;
