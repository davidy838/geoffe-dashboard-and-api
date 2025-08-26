import { useState } from "react";
import FileUpload from "./components/FileUpload";
import Map from "./components/Map";
import type { CalculationResult } from "./types";

function App() {
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResults = (newResults: CalculationResult) => {
    setResults(newResults);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setResults(null);
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Background Map - Always visible */}
      <div
        className="absolute inset-0 z-0"
        style={{ width: "100vw", height: "100vh" }}
      >
        <Map
          communities={results?.communities || []}
          clinics={results?.clinics || []}
          routes={results?.routes || []}
        />
      </div>

      {/* Overlay Content */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900/95 via-blue-800/95 to-indigo-900/95 backdrop-blur-md shadow-2xl p-6 pointer-events-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-wide">
              GEOFFE Dashboard
            </h1>
            <p className="text-blue-100 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Advanced Healthcare Facility Optimization & Route Analysis
              Platform
            </p>
            <div className="flex items-center justify-center space-x-6 mt-4 text-blue-200">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Real-time Analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Interactive Mapping</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Cost Optimization</span>
              </div>
            </div>
          </div>
        </div>

        {/* File Upload or Results */}
        <div className="absolute top-32 left-1/2 transform -translate-x-1/2 w-full max-w-5xl px-4 pointer-events-auto">
          {error ? (
            <div className="bg-red-500/90 backdrop-blur-md border border-red-400 text-white px-6 py-4 rounded-2xl shadow-2xl">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">❌</div>
                <div>
                  <strong className="text-lg">Error:</strong> {error}
                </div>
              </div>
              <button
                onClick={() => setError(null)}
                className="mt-3 bg-white/20 text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/30"
              >
                Try Again
              </button>
            </div>
          ) : results ? (
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                📊 Analysis Results
              </h2>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    ${results.totalSavings.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-700 font-medium">
                    Total Savings
                  </div>
                </div>
                <div className="text-center bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {results.totalDistance.toFixed(0)} km
                  </div>
                  <div className="text-sm text-green-700 font-medium">
                    Total Distance
                  </div>
                </div>
                <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {results.totalTime.toFixed(0)} hrs
                  </div>
                  <div className="text-sm text-purple-700 font-medium">
                    Total Time
                  </div>
                </div>
                <div className="text-center bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {results.totalTrips.toFixed(0)}
                  </div>
                  <div className="text-sm text-orange-700 font-medium">
                    Total Trips
                  </div>
                </div>
              </div>

              {/* Download Button */}
              <div className="text-center space-x-4">
                <button
                  onClick={() => {
                    const blob = new Blob([results.csvData], {
                      type: "text/csv",
                    });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "geoffe_healthcare_optimization_results.csv";
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg"
                >
                  📥 Download Results
                </button>
                <button
                  onClick={() => setResults(null)}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-4 rounded-2xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg"
                >
                  🔄 New Analysis
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
              <FileUpload onResults={handleResults} onError={handleError} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
