import { useState } from "react";
import type { CalculationResult } from "../types";

interface FileUploadProps {
  onResults: (results: CalculationResult) => void;
  onError: (error: string) => void;
}

interface FileInfo {
  name: string;
  description: string;
  icon: string;
  key: string;
  color: string;
}

const FileUpload = ({ onResults, onError }: FileUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [progressMessages, setProgressMessages] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<string>("");

  const fileTypes: FileInfo[] = [
    {
      name: "Communities",
      description: "Communities with coordinates and encounter data",
      icon: "🏘️",
      key: "communities",
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "Clinics",
      description: "Healthcare facilities with coordinates",
      icon: "🏥",
      key: "clinics",
      color: "from-red-500 to-red-600",
    },
    {
      name: "Charlie",
      description: "Patient encounter data by community",
      icon: "📊",
      key: "charlie",
      color: "from-purple-500 to-purple-600",
    },
    {
      name: "Costs",
      description: "Cost structure for different services and age groups",
      icon: "💰",
      key: "costs",
      color: "from-green-500 to-green-600",
    },
  ];

  const handleFileSelect = (fileType: string, file: File) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [fileType]: file,
    }));
  };

  const addProgressMessage = (message: string) => {
    setProgressMessages((prev) => [...prev, message]);
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedFiles).length !== 4) {
      onError("Please select all 4 required CSV files");
      return;
    }

    setIsUploading(true);
    setProgressMessages([]);
    setCurrentStep("Initializing analysis...");

    try {
      const formData = new FormData();
      formData.append("community_file", selectedFiles.communities);
      formData.append("clinic_file", selectedFiles.clinics);
      formData.append("charlie_file", selectedFiles.charlie);
      formData.append("costs_file", selectedFiles.costs);

      // Debug: Log what we're sending
      console.log("Sending files:");
      console.log(
        "Communities:",
        selectedFiles.communities?.name,
        selectedFiles.communities?.size
      );
      console.log(
        "Clinics:",
        selectedFiles.clinics?.name,
        selectedFiles.clinics?.size
      );
      console.log(
        "Charlie:",
        selectedFiles.charlie?.name,
        selectedFiles.charlie?.size
      );
      console.log(
        "Costs:",
        selectedFiles.costs?.name,
        selectedFiles.costs?.size
      );

      addProgressMessage("📤 Uploading files to server...");
      setCurrentStep("Uploading files...");

      const response = await fetch(
        "http://localhost:8000/api/calculate-distances-and-merge-costs",
        {
          method: "POST",
          body: formData,
        }
      );

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      addProgressMessage("✅ Files uploaded successfully!");
      setCurrentStep("Processing analysis...");

      // Simulate progress updates based on typical API processing steps
      const progressSteps = [
        "🔍 Reading CSV files and parsing data...",
        "📍 Calculating distances between communities and clinics...",
        "🛣️ Using Google Maps API for real routing data...",
        "💰 Computing comprehensive costs for all service types...",
        "📊 Merging distance and cost data...",
        "📈 Generating final analysis report...",
        "💾 Preparing results for download...",
      ];

      for (let i = 0; i < progressSteps.length; i++) {
        await new Promise((resolve) =>
          setTimeout(resolve, 800 + Math.random() * 400)
        );
        addProgressMessage(progressSteps[i]);
        setCurrentStep(progressSteps[i]);
      }

      const blob = await response.blob();
      const csvText = await blob.text();

      addProgressMessage("🎉 Analysis complete! Processing results...");
      setCurrentStep("Finalizing results...");

      // Parse the CSV to extract summary data
      const lines = csvText.split("\n");
      const headers = lines[0].split(",");

      // Find summary columns
      const withDistanceIndex = headers.findIndex((h) =>
        h.includes("WITH_total_distance")
      );
      const withoutDistanceIndex = headers.findIndex((h) =>
        h.includes("WITHOUT_total_distance")
      );
      const withDurationIndex = headers.findIndex((h) =>
        h.includes("WITH_total_duration")
      );
      const withoutDurationIndex = headers.findIndex((h) =>
        h.includes("WITHOUT_total_duration")
      );
      const withCO2Index = headers.findIndex((h) =>
        h.includes("WITH_total_CO2")
      );
      const withoutCO2Index = headers.findIndex((h) =>
        h.includes("WITHOUT_total_CO2")
      );
      const withTripsIndex = headers.findIndex((h) =>
        h.includes("WITH_total_trips")
      );
      const withoutTripsIndex = headers.findIndex((h) =>
        h.includes("WITHOUT_total_trips")
      );

      // Calculate totals from the data
      let totalDistance = 0;
      let totalDuration = 0;
      let totalCO2 = 0;
      let totalTrips = 0;

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(",");
          if (withDistanceIndex >= 0 && withoutDistanceIndex >= 0) {
            const withDist = parseFloat(values[withDistanceIndex]) || 0;
            const withoutDist = parseFloat(values[withoutDistanceIndex]) || 0;
            totalDistance += withoutDist - withDist;
          }
          if (withDurationIndex >= 0 && withoutDurationIndex >= 0) {
            const withDur = parseFloat(values[withDurationIndex]) || 0;
            const withoutDur = parseFloat(values[withoutDurationIndex]) || 0;
            totalDuration += withoutDur - withDur;
          }
          if (withCO2Index >= 0 && withoutCO2Index >= 0) {
            const withCO2 = parseFloat(values[withCO2Index]) || 0;
            const withoutCO2 = parseFloat(values[withoutCO2Index]) || 0;
            totalCO2 += withoutCO2 - withCO2;
          }
          if (withTripsIndex >= 0 && withoutTripsIndex >= 0) {
            const withTrips = parseFloat(values[withTripsIndex]) || 0;
            const withoutTrips = parseFloat(values[withoutTripsIndex]) || 0;
            totalTrips += withoutTrips - withTrips;
          }
        }
      }

      // Extract communities and clinics from the data
      const communities: Array<{ name: string; lat: number; lng: number }> = [];
      const clinics: Array<{ name: string; lat: number; lng: number }> = [];
      const routes: Array<{
        from: string;
        to: string;
        distance: number;
        duration: number;
        color: string;
      }> = [];

      // Parse communities and clinics from CSV data
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(",");
          const titleIndex = headers.findIndex((h) => h === "Title");
          const latIndex = headers.findIndex((h) => h === "Latitude");
          const lngIndex = headers.findIndex((h) => h === "Longitude");
          const clinicIndex = headers.findIndex((h) => h === "Nearest Clinic");
          const clinicLatIndex = headers.findIndex(
            (h) => h === "Clinic Latitude"
          );
          const clinicLngIndex = headers.findIndex(
            (h) => h === "Clinic Longitude"
          );
          const distanceIndex = headers.findIndex(
            (h) => h === "Google Distance (km)"
          );
          const durationIndex = headers.findIndex(
            (h) => h === "Duration (hours)"
          );

          if (titleIndex >= 0 && latIndex >= 0 && lngIndex >= 0) {
            const name = values[titleIndex]?.replace(/"/g, "") || "";
            const lat = parseFloat(values[latIndex]) || 0;
            const lng = parseFloat(values[lngIndex]) || 0;

            if (name && lat && lng) {
              communities.push({ name, lat, lng });
            }
          }

          if (clinicIndex >= 0 && clinicLatIndex >= 0 && clinicLngIndex >= 0) {
            const name = values[clinicIndex]?.replace(/"/g, "") || "";
            const lat = parseFloat(values[clinicLatIndex]) || 0;
            const lng = parseFloat(values[clinicLngIndex]) || 0;

            if (name && lat && lng) {
              clinics.push({ name, lat, lng });
            }
          }

          if (
            titleIndex >= 0 &&
            clinicIndex >= 0 &&
            distanceIndex >= 0 &&
            durationIndex >= 0
          ) {
            const from = values[titleIndex]?.replace(/"/g, "") || "";
            const to = values[clinicIndex]?.replace(/"/g, "") || "";
            const distance = parseFloat(values[distanceIndex]) || 0;
            const duration = parseFloat(values[durationIndex]) || 0;

            if (from && to && distance && duration) {
              routes.push({
                from,
                to,
                distance,
                duration,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`,
              });
            }
          }
        }
      }

      // Estimate total savings (this is a placeholder - you might want to calculate this from actual cost data)
      const totalSavings = totalDistance * 0.5; // Rough estimate: $0.50 per km saved

      addProgressMessage("🎯 Results processed successfully!");
      setCurrentStep("Analysis complete!");

      const results: CalculationResult = {
        totalSavings,
        totalDistance,
        totalTime: totalDuration,
        totalCO2,
        totalTrips,
        csvData: csvText,
        communities,
        clinics,
        routes,
      };

      onResults(results);
    } catch (error) {
      addProgressMessage(
        `❌ Error: ${
          error instanceof Error
            ? error.message
            : "An error occurred during upload"
        }`
      );
      onError(
        error instanceof Error
          ? error.message
          : "An error occurred during upload"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const allFilesSelected = Object.keys(selectedFiles).length === 4;

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">
        📁 Upload Your CSV Files
      </h2>

      {/* File Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {fileTypes.map((fileType) => (
          <div
            key={fileType.key}
            className={`relative overflow-hidden rounded-2xl transition-all duration-300 transform hover:scale-105 ${
              selectedFiles[fileType.key]
                ? "ring-4 ring-green-400 shadow-2xl"
                : "ring-2 ring-gray-200 hover:ring-gray-300 shadow-lg hover:shadow-xl"
            }`}
          >
            {/* Background gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${fileType.color} opacity-10`}
            />

            {/* Content */}
            <div className="relative p-6 bg-white/80 backdrop-blur-sm">
              <div className="text-5xl mb-4">{fileType.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                {fileType.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {fileType.description}
              </p>

              {selectedFiles[fileType.key] ? (
                <div className="bg-green-100 border border-green-200 rounded-xl p-3">
                  <div className="flex items-center justify-center space-x-2 text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-sm">
                      ✓ {selectedFiles[fileType.key].name}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileSelect(fileType.key, file);
                        }
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          {fileTypes.map((fileType) => (
            <div
              key={fileType.key}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                selectedFiles[fileType.key]
                  ? "bg-green-500 scale-125 shadow-lg"
                  : "bg-gray-300"
              }`}
            />
          ))}
        </div>
        <div className="bg-gray-100 rounded-full h-2 w-64 mx-auto overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all duration-500 ease-out"
            style={{
              width: `${(Object.keys(selectedFiles).length / 4) * 100}%`,
            }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-3 font-medium">
          {Object.keys(selectedFiles).length}/4 files selected
        </p>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!allFilesSelected || isUploading}
        className={`px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform ${
          allFilesSelected && !isUploading
            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl hover:shadow-3xl hover:scale-105 hover:from-blue-700 hover:to-purple-700"
            : "bg-gray-400 text-gray-200 cursor-not-allowed shadow-lg"
        }`}
      >
        {isUploading ? (
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processing Analysis...</span>
          </div>
        ) : (
          "🚀 Start Analysis"
        )}
      </button>

      {/* Progress Display */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="text-center mb-6">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Analysis in Progress
              </h3>
              <p className="text-gray-600">{currentStep}</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 max-h-64 overflow-y-auto">
              <h4 className="font-semibold text-gray-800 mb-3 text-left">
                Progress Log:
              </h4>
              <div className="space-y-2 text-left">
                {progressMessages.map((message, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-2 text-sm"
                  >
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span className="text-gray-700">{message}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                This may take a few minutes depending on the size of your
                data...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
