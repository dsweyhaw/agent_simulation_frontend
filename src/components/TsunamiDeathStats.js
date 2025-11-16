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
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";

const TsunamiDeathStats = ({ data }) => {
  // Process data to extract death statistics
  const processedData = useMemo(() => {
    if (!data || !data.steps) return [];

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

      // Extract death data with fallback variable names
      const deadLocals = getVarValue(['Dead locals', 'dead locals', 'Dead Locals', 'deadLocals', 'Casualties locals', 'casualties locals']);
      const deadTourists = getVarValue(['Dead tourists', 'dead tourists', 'Dead Tourists', 'deadTourists', 'Casualties tourists', 'casualties tourists']);
      const deadRescuers = getVarValue(['Dead rescuers', 'dead rescuers', 'Dead Rescuers', 'deadRescuers', 'Casualties rescuers', 'casualties rescuers']);
      const deadCars = getVarValue(['Dead cars', 'dead cars', 'Dead Cars', 'deadCars', 'Casualties cars', 'casualties cars']);
      const deadBoats = getVarValue(['Dead boats', 'dead boats', 'Dead Boats', 'deadBoats', 'Casualties boats', 'casualties boats']);

      // Extract total populations for percentage calculations with fallback variable names
      const safeLocals = getVarValue(['Safe locals', 'safe locals', 'Safe Locals', 'safeLocals']);
      const dangerLocals = getVarValue(['In danger locals', 'in danger locals', 'In Danger Locals', 'inDangerLocals', 'Danger locals', 'danger locals']);
      const totalLocals = safeLocals + deadLocals + dangerLocals;

      const safeTourists = getVarValue(['Safe tourists', 'safe tourists', 'Safe Tourists', 'safeTourists']);
      const dangerTourists = getVarValue(['In danger tourists', 'in danger tourists', 'In Danger Tourists', 'inDangerTourists', 'Danger tourists', 'danger tourists']);
      const totalTourists = safeTourists + deadTourists + dangerTourists;

      const safeRescuers = getVarValue(['Safe rescuers', 'safe rescuers', 'Safe Rescuers', 'safeRescuers']);
      const dangerRescuers = getVarValue(['In danger rescuers', 'in danger rescuers', 'In Danger Rescuers', 'inDangerRescuers', 'Danger rescuers', 'danger rescuers']);
      const totalRescuers = safeRescuers + deadRescuers + dangerRescuers;

      const safeCars = getVarValue(['Safe cars', 'safe cars', 'Safe Cars', 'safeCars']);
      const totalCars = safeCars + deadCars;

      const safeBoats = getVarValue(['Safe boats', 'safe boats', 'Safe Boats', 'safeBoats']);
      const totalBoats = safeBoats + deadBoats;

      // Calculate death percentages
      const localDeathRate = totalLocals > 0 ? (deadLocals / totalLocals * 100) : 0;
      const touristDeathRate = totalTourists > 0 ? (deadTourists / totalTourists * 100) : 0;
      const rescuerDeathRate = totalRescuers > 0 ? (deadRescuers / totalRescuers * 100) : 0;
      const carDestructionRate = totalCars > 0 ? (deadCars / totalCars * 100) : 0;
      const boatDestructionRate = totalBoats > 0 ? (deadBoats / totalBoats * 100) : 0;

      const totalDeaths = deadLocals + deadTourists + deadRescuers + deadCars + deadBoats;
      const totalPopulation = totalLocals + totalTourists + totalRescuers + totalCars + totalBoats;
      const overallDeathRate = totalPopulation > 0 ? (totalDeaths / totalPopulation * 100) : 0;

      return {
        step: stepId,
        // Absolute numbers
        deadLocals,
        deadTourists,
        deadRescuers,
        deadCars,
        deadBoats,
        totalDeaths,
        // Percentages
        localDeathRate: parseFloat(localDeathRate.toFixed(1)),
        touristDeathRate: parseFloat(touristDeathRate.toFixed(1)),
        rescuerDeathRate: parseFloat(rescuerDeathRate.toFixed(1)),
        carDestructionRate: parseFloat(carDestructionRate.toFixed(1)),
        boatDestructionRate: parseFloat(boatDestructionRate.toFixed(1)),
        overallDeathRate: parseFloat(overallDeathRate.toFixed(1)),
        // Populations for context
        totalLocals,
        totalTourists,
        totalRescuers,
        totalCars,
        totalBoats,
        totalPopulation,
      };
    }).filter(item => item.totalPopulation > 0); // Filter out steps with no data
  }, [data]);

  // Get latest statistics
  const latestStats = processedData.length > 0 ? processedData[processedData.length - 1] : null;

  // Prepare data for death rate comparison
  const deathRateComparisonData = [
    { category: "🟡 Locals", deathRate: latestStats?.localDeathRate || 0, deaths: latestStats?.deadLocals || 0, total: latestStats?.totalLocals || 0 },
    { category: "🟣 Tourists", deathRate: latestStats?.touristDeathRate || 0, deaths: latestStats?.deadTourists || 0, total: latestStats?.totalTourists || 0 },
    { category: "🔵 Rescuers", deathRate: latestStats?.rescuerDeathRate || 0, deaths: latestStats?.deadRescuers || 0, total: latestStats?.totalRescuers || 0 },
    { category: "🚗 Cars", deathRate: latestStats?.carDestructionRate || 0, deaths: latestStats?.deadCars || 0, total: latestStats?.totalCars || 0 },
    { category: "🚤 Boats", deathRate: latestStats?.boatDestructionRate || 0, deaths: latestStats?.deadBoats || 0, total: latestStats?.totalBoats || 0 },
  ].filter(item => item.total > 0);

  if (!processedData.length) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500 text-lg">
          💀 No death statistics available for this simulation
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
          <div className="text-red-800 text-lg font-semibold mb-2">💀 Total Deaths</div>
          <div className="text-3xl font-bold text-red-900">{latestStats?.totalDeaths || 0}</div>
          <div className="text-red-600 text-sm">All casualties</div>
        </div>

        <div className="bg-orange-50 p-6 rounded-lg border-2 border-orange-200">
          <div className="text-orange-800 text-lg font-semibold mb-2">📊 Overall Death Rate</div>
          <div className="text-3xl font-bold text-orange-900">{latestStats?.overallDeathRate || 0}%</div>
          <div className="text-orange-600 text-sm">Of total population</div>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200">
          <div className="text-yellow-800 text-lg font-semibold mb-2">🟡 Highest Risk Group</div>
          <div className="text-2xl font-bold text-yellow-900">
            {deathRateComparisonData.length > 0 
              ? deathRateComparisonData.reduce((max, current) => 
                  current.deathRate > max.deathRate ? current : max
                ).category 
              : "N/A"}
          </div>
          <div className="text-yellow-600 text-sm">
            {deathRateComparisonData.length > 0 
              ? `${deathRateComparisonData.reduce((max, current) => 
                  current.deathRate > max.deathRate ? current : max
                ).deathRate}% death rate`
              : "No data"}
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
          <div className="text-green-800 text-lg font-semibold mb-2">🟢 Safest Group</div>
          <div className="text-2xl font-bold text-green-900">
            {deathRateComparisonData.length > 0 
              ? deathRateComparisonData.reduce((min, current) => 
                  current.deathRate < min.deathRate ? current : min
                ).category 
              : "N/A"}
          </div>
          <div className="text-green-600 text-sm">
            {deathRateComparisonData.length > 0 
              ? `${deathRateComparisonData.reduce((min, current) => 
                  current.deathRate < min.deathRate ? current : min
                ).deathRate}% death rate`
              : "No data"}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Death Rate Over Time */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">📈 Death Rates Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="step" />
              <YAxis label={{ value: 'Death Rate (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`${value}%`, 'Death Rate']} />
              <Legend />
              <Line type="monotone" dataKey="localDeathRate" stroke="#F59E0B" strokeWidth={2} name="Locals" />
              <Line type="monotone" dataKey="touristDeathRate" stroke="#A855F7" strokeWidth={2} name="Tourists" />
              <Line type="monotone" dataKey="rescuerDeathRate" stroke="#3B82F6" strokeWidth={2} name="Rescuers" />
              <Line type="monotone" dataKey="overallDeathRate" stroke="#EF4444" strokeWidth={3} name="Overall" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Current Death Rate Comparison */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">🎯 Death Rate by Group</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deathRateComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis label={{ value: 'Death Rate (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`${value}%`, 'Death Rate']} />
              <Bar dataKey="deathRate" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cumulative Deaths Over Time */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">💀 Cumulative Deaths Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="step" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="deadLocals" stackId="1" stroke="#F59E0B" fill="#F59E0B" name="Locals" />
              <Area type="monotone" dataKey="deadTourists" stackId="1" stroke="#A855F7" fill="#A855F7" name="Tourists" />
              <Area type="monotone" dataKey="deadRescuers" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="Rescuers" />
              <Area type="monotone" dataKey="deadCars" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" name="Cars" />
              <Area type="monotone" dataKey="deadBoats" stackId="1" stroke="#06B6D4" fill="#06B6D4" name="Boats" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Absolute Deaths by Category */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">🔢 Total Deaths by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deathRateComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="deaths" fill="#DC2626" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Statistics Table */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">📋 Detailed Death Statistics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Group</th>
                <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Total Population</th>
                <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Deaths</th>
                <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Death Rate</th>
                <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Survivors</th>
              </tr>
            </thead>
            <tbody>
              {deathRateComparisonData.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border border-gray-300 px-4 py-2 font-medium">{row.category}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{row.total}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center text-red-600 font-semibold">{row.deaths}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <span className={`font-semibold ${
                      row.deathRate > 50 ? 'text-red-600' : 
                      row.deathRate > 25 ? 'text-orange-600' : 
                      row.deathRate > 10 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {row.deathRate}%
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center text-green-600 font-semibold">
                    {row.total - row.deaths}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analysis Summary */}
      <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
        <h3 className="text-xl font-semibold mb-4 text-blue-800">🔍 Analysis Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">Key Findings:</h4>
            <ul className="space-y-1 text-blue-600">
              <li>• Total casualties: <strong>{latestStats?.totalDeaths || 0}</strong> out of {latestStats?.totalPopulation || 0}</li>
              <li>• Overall survival rate: <strong>{latestStats ? (100 - latestStats.overallDeathRate).toFixed(1) : 0}%</strong></li>
              <li>• Most vulnerable group: <strong>
                {deathRateComparisonData.length > 0 
                  ? deathRateComparisonData.reduce((max, current) => 
                      current.deathRate > max.deathRate ? current : max
                    ).category 
                  : "N/A"}
              </strong></li>
              <li>• Best protected group: <strong>
                {deathRateComparisonData.length > 0 
                  ? deathRateComparisonData.reduce((min, current) => 
                      current.deathRate < min.deathRate ? current : min
                    ).category 
                  : "N/A"}
              </strong></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">Recommendations:</h4>
            <ul className="space-y-1 text-blue-600">
              <li>• Improve evacuation routes for high-risk areas</li>
              <li>• Deploy more rescue boats in coastal zones</li>
              <li>• Enhance early warning systems</li>
              <li>• Provide better safety training for tourists</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TsunamiDeathStats;

