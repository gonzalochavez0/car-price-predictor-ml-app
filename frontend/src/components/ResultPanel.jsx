const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const currencyPrecise = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatInterval(result) {
  if (result.interval?.low != null && result.interval?.high != null) {
    return { low: result.interval.low, high: result.interval.high, derived: false };
  }

  // Older API versions do not return a band: fall back to a transparent ±10%.
  return {
    low: result.estimated_price * 0.9,
    high: result.estimated_price * 1.1,
    derived: true,
  };
}

export default function ResultPanel({ result, onClear }) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-300 to-pink-400 flex items-center justify-center text-white text-2xl mb-4">
          <img src="/flecha.png" alt="" width="36" height="36" />
        </div>
        <h2 className="text-lg font-semibold text-gray-700">Esperando Cálculo</h2>
        <p className="text-gray-400 text-sm mt-2">
          Completa el formulario y presiona &quot;Calcular Precio Estimado&quot;
        </p>
      </div>
    );
  }

  const { low, high, derived } = formatInterval(result);
  const { inputs } = result;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Resultado de la Predicción</h2>

      <div className="bg-gradient-to-r from-blue-400 to-purple-400 text-white p-5 rounded-xl mb-4">
        <p className="text-sm opacity-80">Precio Estimado</p>
        <p className="text-2xl font-bold">{currencyPrecise.format(result.estimated_price)}</p>
        <p className="text-xs opacity-80 mt-1">
          {derived ? "Rango: " : "Rango entre árboles: "}
          {currency.format(low)} – {currency.format(high)}
        </p>
      </div>

      <div className="space-y-2 text-sm">
        <div className="bg-blue-50 p-3 rounded-xl">
          <p className="text-xs text-gray-500">Marca</p>
          <p className="font-medium">{inputs.brand}</p>
        </div>

        <div className="bg-blue-50 p-3 rounded-xl">
          <p className="text-xs text-gray-500">Año</p>
          <p className="font-medium">{inputs.year}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-blue-50 p-3 rounded-xl">
            <p className="text-xs text-gray-500">Combustible</p>
            <p className="font-medium">{inputs.fuel_type}</p>
          </div>

          <div className="bg-blue-50 p-3 rounded-xl">
            <p className="text-xs text-gray-500">Transmisión</p>
            <p className="font-medium">{inputs.transmission}</p>
          </div>

          <div className="bg-blue-50 p-3 rounded-xl">
            <p className="text-xs text-gray-500">Motor</p>
            <p className="font-medium">{inputs.engine_cc} cc</p>
          </div>

          <div className="bg-blue-50 p-3 rounded-xl">
            <p className="text-xs text-gray-500">Consumo</p>
            <p className="font-medium">{inputs.mileage_kmpl} km/l</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => window.print()}
        className="no-print w-full mt-4 p-3 rounded-xl bg-gradient-to-r from-orange-300 to-pink-400 text-white hover:scale-[1.02] transition"
      >
        Descargar Reporte PDF
      </button>

      <button
        type="button"
        onClick={onClear}
        className="no-print w-full mt-2 p-3 rounded-xl bg-gradient-to-r from-red-300 to-pink-400 text-white hover:scale-[1.02] transition"
      >
        Limpiar Resultado
      </button>

      <p className="text-xs text-gray-400 mt-4 text-center">
        * Estimación generada por un modelo entrenado con datos simulados. No es una tasación
        oficial.
      </p>
    </div>
  );
}
