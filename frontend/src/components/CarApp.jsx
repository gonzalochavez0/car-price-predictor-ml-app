import { useState } from "react";
import PredictForm from "./PredictForm";
import ResultPanel from "./ResultPanel";

export default function CarApp() {
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState(null);
  const clearResult = () => {
    setResult(null);
    setFormData(null);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-2xl shadow">
        <PredictForm setResult={setResult} setFormData={setFormData} />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow">
        <ResultPanel
          result={result}
          formData={formData}
          clearResult={clearResult}
        />
      </div>
    </div>
  );
}
