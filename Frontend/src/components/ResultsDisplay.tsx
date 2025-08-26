import {
  Download,
  ArrowLeft,
  TrendingUp,
  MapPin,
  Clock,
  Leaf,
  Car,
} from "lucide-react";
import type { CalculationResult } from "../types";

interface ResultsDisplayProps {
  results: CalculationResult;
  onReset: () => void;
}

const ResultsDisplay = ({ results, onReset }: ResultsDisplayProps) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <button onClick={onReset} className="btn btn-secondary back-btn">
          <ArrowLeft size={20} />
          New Analysis
        </button>
        <h2>Analysis Complete</h2>
        <p>Your healthcare facility analysis has been processed successfully</p>
      </div>

      <div className="results-summary">
        <div className="summary-card primary">
          <div className="summary-icon">
            <TrendingUp size={24} />
          </div>
          <div className="summary-content">
            <h3>Total Savings</h3>
            <p className="summary-value">
              {formatCurrency(results.summary.totalSavings)}
            </p>
            <span className="summary-label">Cost optimization achieved</span>
          </div>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon">
              <MapPin size={20} />
            </div>
            <div className="summary-content">
              <h4>Distance Savings</h4>
              <p className="summary-value">
                {formatNumber(results.summary.totalDistanceSavings)} km
              </p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">
              <Clock size={20} />
            </div>
            <div className="summary-content">
              <h4>Time Savings</h4>
              <p className="summary-value">
                {formatNumber(results.summary.totalDurationSavings)} hours
              </p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">
              <Leaf size={20} />
            </div>
            <div className="summary-content">
              <h4>CO₂ Reduction</h4>
              <p className="summary-value">
                {formatNumber(results.summary.totalCO2Savings)} kg
              </p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">
              <Car size={20} />
            </div>
            <div className="summary-content">
              <h4>Trip Reduction</h4>
              <p className="summary-value">
                {formatNumber(results.summary.totalTripsSavings)} trips
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="results-actions">
        <div className="action-card">
          <h3>Download Results</h3>
          <p>
            Your detailed analysis has been automatically downloaded as a CSV
            file
          </p>
          <div className="action-buttons">
            <button className="btn btn-primary">
              <Download size={20} />
              Download Again
            </button>
          </div>
        </div>

        <div className="action-card">
          <h3>Next Steps</h3>
          <ul className="next-steps">
            <li>Review the downloaded CSV for detailed insights</li>
            <li>Analyze cost savings by service type and age group</li>
            <li>Identify communities with highest optimization potential</li>
            <li>Plan resource allocation based on findings</li>
          </ul>
        </div>
      </div>

      <div className="results-footer">
        <p>
          Analysis completed successfully. All data has been processed and
          optimized for healthcare facility planning.
        </p>
      </div>
    </div>
  );
};

export default ResultsDisplay;
