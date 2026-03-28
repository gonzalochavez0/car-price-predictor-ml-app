import { useState } from "react";

export default function PredictForm({ setResult, setFormData }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const year = e.target.year.value;
      const engine = e.target.engine_cc.value;
      const mileage = e.target.mileage_kmpl.value;
      const fuel = e.target.fuel_type.value;
      const transmission = e.target.transmission.value;
      const brand = e.target.brand.value;

      if (year < 1990 || year > 2025) {
        alert("Invalid year");
        setLoading(false);
        return;
      }

      const response = await fetch("radiant-wonder-production-b5c2.up.railway.app/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year: Number(year),
          engine_cc: Number(engine),
          mileage_kmpl: Number(mileage),
          fuel_type: fuel,
          transmission: transmission,
          brand: brand,
        }),
      });

      const data = await response.json();

      setResult(data.estimated_price);

      setFormData({
        year,
        engine,
        mileage,
        fuel,
        transmission,
        brand,
      });
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Datos del Vehículo</h1>
      <p className="text-sm text-gray-400 mb-4">
        Completa la información de tu auto
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="text-sm text-gray-600">Año del Vehículo</label>
          <input
            name="year"
            type="number"
            className="w-full mt-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-600">Motor (cc)</label>
          <input
            name="engine_cc"
            type="number"
            className="w-full mt-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-600">Consumo (km/l)</label>
          <input
            name="mileage_kmpl"
            type="number"
            className="w-full mt-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-600">Combustible</label>
          <select
            name="fuel_type"
            className="w-full mt-1 p-3 rounded-xl border border-gray-200"
          >
            <option value="Petrol">Gasolina</option>
            <option value="Diesel">Diesel</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-600">Transmisión</label>
          <select
            name="transmission"
            className="w-full mt-1 p-3 rounded-xl border border-gray-200"
          >
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatico</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-600">Marca</label>
          <select
            name="brand"
            className="w-full mt-1 p-3 rounded-xl border border-gray-200"
          >
            <option>Toyota</option>
            <option>BMW</option>
            <option>Honda</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 p-3 rounded-xl text-white font-medium bg-gradient-to-r from-blue-400 to-purple-400 hover:scale-[1.02] transition"
        >
          {loading ? "Calculando..." : "Calcular Precio Estimado"}
        </button>
      </form>
    </div>
  );
}
