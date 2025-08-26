import React from "react";
import type { CalculationResult } from "../types";

interface ResultsDisplayProps {
  results: CalculationResult;
  onNewAnalysis: () => void;
  onShowMap?: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  results,
  onNewAnalysis,
  onShowMap,
}) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    }
    return `$${num.toFixed(0)}`;
  };

  const formatDistance = (km: number) => {
    if (km >= 1000) {
      return `${(km / 1000).toFixed(1)}K km`;
    }
    return `${km.toFixed(1)} km`;
  };

  const formatTime = (hours: number) => {
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours.toFixed(1)}h`;
    }
    return `${hours.toFixed(1)}h`;
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Analysis Complete! 🎉
            </h1>
            <p className="text-xl text-gray-600">
              Your healthcare facility optimization analysis is ready
            </p>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {/* Total Savings */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Savings
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(results.totalSavings)}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Distance */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Distance
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatDistance(results.totalDistance)}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Time */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Time
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatTime(results.totalTime)}
                  </p>
                </div>
              </div>
            </div>

            {/* Total CO2 */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-emerald-500">
              <div className="flex items-center">
                <div className="p-3 bg-emerald-100 rounded-full">
                  <svg
                    className="w-8 h-8 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total CO2</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {results.totalCO2.toFixed(1)} kg
                  </p>
                </div>
              </div>
            </div>

            {/* Total Trips */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-full">
                  <svg
                    className="w-8 h-8 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Trips
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {results.totalTrips.toFixed(0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={onNewAnalysis}
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              🚀 New Analysis
            </button>

            {onShowMap && (
              <button
                onClick={onShowMap}
                className="px-8 py-4 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                🗺️ View Map
              </button>
            )}

            {results.csvData && (
              <a
                href={`data:text/csv;charset=utf-8,${encodeURIComponent(
                  results.csvData
                )}`}
                download="healthcare_analysis_results.csv"
                className="px-8 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center"
              >
                📊 Download Results
              </a>
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Next Steps 📋
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Review Analysis
                </h3>
                <p className="text-gray-600 text-sm">
                  Examine the cost savings and optimization opportunities
                  identified
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🗺️</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Map Visualization
                </h3>
                <p className="text-gray-600 text-sm">
                  Explore the interactive map showing communities and clinic
                  routes
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💡</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Take Action
                </h3>
                <p className="text-gray-600 text-sm">
                  Implement the recommended changes to optimize healthcare
                  delivery
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
