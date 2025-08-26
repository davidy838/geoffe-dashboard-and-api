import { useState, useCallback } from "react";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import type { FileUploadState, UploadProgress } from "../types";
import axios from "axios";

interface FileUploadProps {
  onCalculationComplete: (data: any) => void;
  onError: (error: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const FileUpload = ({
  onCalculationComplete,
  onError,
  setIsLoading,
}: FileUploadProps) => {
  const [files, setFiles] = useState<FileUploadState>({
    communityFile: null,
    clinicFile: null,
    charlieFile: null,
    costsFile: null,
  });

  const [progress, setProgress] = useState<UploadProgress>({
    uploading: false,
    processing: false,
    complete: false,
  });

  const [dragOver, setDragOver] = useState<string | null>(null);

  const handleFileSelect = (fileType: keyof FileUploadState, file: File) => {
    setFiles((prev) => ({ ...prev, [fileType]: file }));
  };

  const handleDragOver = useCallback((e: React.DragEvent, fileType: string) => {
    e.preventDefault();
    setDragOver(fileType);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, fileType: keyof FileUploadState) => {
      e.preventDefault();
      setDragOver(null);

      const file = e.dataTransfer.files[0];
      if ((file && file.type === "text/csv") || file.name.endsWith(".csv")) {
        handleFileSelect(fileType, file);
      }
    },
    []
  );

  const handleSubmit = async () => {
    if (
      !files.communityFile ||
      !files.clinicFile ||
      !files.charlieFile ||
      !files.costsFile
    ) {
      onError("Please upload all required CSV files");
      return;
    }

    setIsLoading(true);
    setProgress({ uploading: true, processing: false, complete: false });

    try {
      const formData = new FormData();
      formData.append("community_file", files.communityFile);
      formData.append("clinic_file", files.clinicFile);
      formData.append("charlie_file", files.charlieFile);
      formData.append("costs_file", files.costsFile);

      setProgress({ uploading: false, processing: true, complete: false });

      // Use the configured API URL
      const response = await axios.post(
        import.meta.env.DEV 
          ? "http://localhost:8000/api/calculate-distances-and-merge-costs"
          : "https://your-service-name.onrender.com/api/calculate-distances-and-merge-costs",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          responseType: "blob",
        }
      );

      setProgress({ uploading: false, processing: false, complete: true });

      // Create download link for the CSV result
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "analysis_results.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      onCalculationComplete({
        data: [],
        summary: {
          totalSavings: 0,
          totalDistanceSavings: 0,
          totalDurationSavings: 0,
          totalCO2Savings: 0,
          totalTripsSavings: 0,
        },
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      onError(
        error.response?.data?.error || "An error occurred during processing"
      );
    } finally {
      setIsLoading(false);
      setProgress({ uploading: false, processing: false, complete: false });
    }
  };

  const FileUploadArea = ({
    fileType,
    label,
    description,
  }: {
    fileType: keyof FileUploadState;
    label: string;
    description: string;
  }) => {
    const file = files[fileType];
    const isDragOver = dragOver === fileType;

    return (
      <div
        className={`file-upload-area ${isDragOver ? "drag-over" : ""} ${
          file ? "has-file" : ""
        }`}
        onDragOver={(e) => handleDragOver(e, fileType)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, fileType)}
      >
        <input
          type="file"
          accept=".csv"
          onChange={(e) =>
            e.target.files?.[0] && handleFileSelect(fileType, e.target.files[0])
          }
          className="file-input"
          id={fileType}
        />

        <label htmlFor={fileType} className="file-label">
          {file ? (
            <div className="file-info">
              <CheckCircle className="file-icon success" size={24} />
              <span className="file-name">{file.name}</span>
            </div>
          ) : (
            <div className="upload-prompt">
              <Upload className="upload-icon" size={32} />
              <span className="upload-text">{label}</span>
              <span className="upload-description">{description}</span>
            </div>
          )}
        </label>
      </div>
    );
  };

  const allFilesUploaded = Object.values(files).every((file) => file !== null);

  return (
    <div className="file-upload-container">
      <div className="upload-header">
        <h2>Upload CSV Files for Analysis</h2>
        <p>
          Upload the required CSV files to calculate distances and merge costs
        </p>
      </div>

      <div className="file-grid">
        <FileUploadArea
          fileType="communityFile"
          label="Community File"
          description="CSV with Title, Latitude, Longitude"
        />

        <FileUploadArea
          fileType="clinicFile"
          label="Clinic File"
          description="CSV with Facility, latitude, longitude"
        />

        <FileUploadArea
          fileType="charlieFile"
          label="CHARLiE File"
          description="CSV with community_name, age_group encounters"
        />

        <FileUploadArea
          fileType="costsFile"
          label="Costs File"
          description="CSV with cost equations"
        />
      </div>

      <div className="upload-actions">
        <button
          className={`btn btn-primary ${
            !allFilesUploaded || progress.uploading || progress.processing
              ? "disabled"
              : ""
          }`}
          onClick={handleSubmit}
          disabled={
            !allFilesUploaded || progress.uploading || progress.processing
          }
        >
          {progress.uploading && <Loader2 className="spinner" size={20} />}
          {progress.processing && <Loader2 className="spinner" size={20} />}
          {progress.uploading
            ? "Uploading..."
            : progress.processing
            ? "Processing..."
            : "Analyze Data"}
        </button>
      </div>

      <div className="upload-info">
        <div className="info-item">
          <AlertCircle size={16} />
          <span>All files must be in CSV format</span>
        </div>
        <div className="info-item">
          <FileText size={16} />
          <span>Results will be downloaded as a CSV file</span>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
