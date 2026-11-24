import { useEffect, useRef, useState } from "react";
import Field from "./Field";
import { ApiError, predictPrice } from "../lib/api";

const FALLBACK = {
  year: { min: 1990, max: 2025 },
  engine_cc: { min: 800, max: 5000 },
  mileage_kmpl: { min: 5, max: 35 },
};

/** Sensible starting point for the demo, clamped to what the model knows. */
function initialValues(metadata) {
  const ranges = { ...FALLBACK, ...(metadata?.ranges ?? {}) };
  const clamp = (value, { min, max }) => Math.min(Math.max(value, min), max);

  return {
    year: String(clamp(2018, ranges.year)),
    engine_cc: String(clamp(1600, ranges.engine_cc)),
    mileage_kmpl: String(clamp(16, ranges.mileage_kmpl)),
    fuel_type: metadata?.fuel_types?.[0] ?? "Petrol",
    transmission: metadata?.transmissions?.[0] ?? "Manual",
    brand: metadata?.brands?.[0] ?? "Toyota",
  };
}

function validate(values, metadata) {
  const ranges = { ...FALLBACK, ...(metadata?.ranges ?? {}) };
  const errors = {};

  for (const field of ["year", "engine_cc", "mileage_kmpl"]) {
    const raw = values[field];

    if (raw === "") {
      errors[field] = "Este campo es obligatorio.";
      continue;
    }

    const number = Number(raw);
    const { min, max } = ranges[field];

    if (Number.isNaN(number)) {
      errors[field] = "Introduce un número válido.";
    } else if (number < min || number > max) {
      errors[field] = `El valor debe estar entre ${min} y ${max}.`;
    }
  }

  return errors;
}

export default function PredictForm({ metadata, onResult, onPending, disabled }) {
  const [values, setValues] = useState(() => initialValues(null));
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const touched = useRef(false);

  // Once the catalog arrives, adopt its first options unless the user typed.
  useEffect(() => {
    if (!metadata || touched.current) return;
    setValues(initialValues(metadata));
  }, [metadata]);

  const ranges = { ...FALLBACK, ...(metadata?.ranges ?? {}) };

  const update = (field) => (value) => {
    touched.current = true;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validate(values, metadata);
    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    onPending?.(true);

    try {
      const payload = {
        year: Number(values.year),
        engine_cc: Number(values.engine_cc),
        mileage_kmpl: Number(values.mileage_kmpl),
        fuel_type: values.fuel_type,
        transmission: values.transmission,
        brand: values.brand,
      };

      const data = await predictPrice(payload);
      onResult({ ...data, inputs: payload });
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.message);
      } else {
        setSubmitError("Ocurrió un error inesperado. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
      onPending?.(false);
    }
  };

  const busy = loading || disabled;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Datos del Vehículo</h1>
      <p className="text-sm text-gray-400 mb-4">Completa la información de tu auto</p>

      <form onSubmit={handleSubmit} noValidate>
        <Field
          id="year"
          label="Año del Vehículo"
          value={values.year}
          onChange={update("year")}
          min={ranges.year.min}
          max={ranges.year.max}
          step="1"
          placeholder={`${ranges.year.min} – ${ranges.year.max}`}
          hint={metadata ? `Datos del modelo: ${ranges.year.min} – ${ranges.year.max}` : undefined}
          error={errors.year}
          disabled={busy}
        />

        <Field
          id="engine_cc"
          label="Motor (cc)"
          value={values.engine_cc}
          onChange={update("engine_cc")}
          min={ranges.engine_cc.min}
          max={ranges.engine_cc.max}
          step="10"
          placeholder={`${ranges.engine_cc.min} – ${ranges.engine_cc.max}`}
          error={errors.engine_cc}
          disabled={busy}
        />

        <Field
          id="mileage_kmpl"
          label="Consumo (km/l)"
          value={values.mileage_kmpl}
          onChange={update("mileage_kmpl")}
          min={ranges.mileage_kmpl.min}
          max={ranges.mileage_kmpl.max}
          step="0.1"
          placeholder={`${ranges.mileage_kmpl.min} – ${ranges.mileage_kmpl.max}`}
          error={errors.mileage_kmpl}
          disabled={busy}
        />

        <Field
          id="fuel_type"
          label="Combustible"
          value={values.fuel_type}
          onChange={update("fuel_type")}
          options={metadata?.fuel_types}
          disabled={busy}
        />

        <Field
          id="transmission"
          label="Transmisión"
          value={values.transmission}
          onChange={update("transmission")}
          options={metadata?.transmissions}
          disabled={busy}
        />

        <Field
          id="brand"
          label="Marca"
          value={values.brand}
          onChange={update("brand")}
          options={metadata?.brands}
          disabled={busy}
        />

        {submitError && (
          <p role="alert" className="mb-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full mt-2 p-3 rounded-xl text-white font-medium bg-gradient-to-r from-blue-400 to-purple-400 hover:scale-[1.02] transition disabled:opacity-60 disabled:hover:scale-100"
        >
          {loading ? "Calculando..." : "Calcular Precio Estimado"}
        </button>
      </form>
    </div>
  );
}
