import { useEffect, useState } from "react";
import PredictForm from "./PredictForm";
import ResultPanel from "./ResultPanel";
import { fetchMetadata } from "../lib/api";

function StatusBadge({ status, onRetry }) {
  const styles = {
    loading: "bg-amber-50 text-amber-700 border-amber-200",
    ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
    offline: "bg-red-50 text-red-700 border-red-200",
  };

  const labels = {
    loading: "Conectando con la API...",
    ready: "API conectada",
    offline: "API sin conexión",
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`text-xs border rounded-full px-3 py-1 inline-flex items-center gap-2 ${styles[status]}`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          status === "ready" ? "bg-emerald-500" : status === "offline" ? "bg-red-500" : "bg-amber-500 animate-pulse"
        }`}
        aria-hidden="true"
      />
      <span>{labels[status]}</span>

      {status === "offline" && (
        <button type="button" onClick={onRetry} className="underline font-medium">
          Reintentar
        </button>
      )}
    </div>
  );
}

export default function CarApp() {
  const [result, setResult] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [status, setStatus] = useState("loading");
  const [connectionError, setConnectionError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    setConnectionError("");

    fetchMetadata(controller.signal)
      .then((data) => {
        setMetadata(data);
        setStatus("ready");
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setStatus("offline");
        setConnectionError(error.message);
      });

    return () => controller.abort();
  }, [attempt]);

  const clearResult = () => setResult(null);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="no-print bg-white p-6 rounded-2xl shadow">
        <div className="mb-4">
          <StatusBadge status={status} onRetry={() => setAttempt((value) => value + 1)} />
        </div>

        {status === "offline" && connectionError && (
          <p role="alert" className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
            {connectionError}
          </p>
        )}

        <PredictForm metadata={metadata} onResult={setResult} />
      </div>

      <div className="print-area bg-white p-6 rounded-2xl shadow">
        <ResultPanel result={result} onClear={clearResult} />
      </div>
    </div>
  );
}
