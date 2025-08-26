import { useState } from "react";
import "./App.css";
import Header from "./components/Header";
import FileUpload from "./components/FileUpload";
import ResultsDisplay from "./components/ResultsDisplay";
import type { CalculationResult } from "./types";

function App() {
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculationComplete = (data: CalculationResult) => {
    setResults(data);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setResults(null);
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
  };

  return (
    <div className="App">
      <Header />
      <main className="main-content">
        {!results ? (
          <FileUpload
            onCalculationComplete={handleCalculationComplete}
            onError={handleError}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        ) : (
          <ResultsDisplay results={results} onReset={handleReset} />
        )}

        {error && (
          <div className="error-message">
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={handleReset} className="btn btn-secondary">
              Try Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
