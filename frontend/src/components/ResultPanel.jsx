export default function ResultPanel({ result, formData, clearResult }) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-300 to-pink-400 flex items-center justify-center text-white text-2xl mb-4">
          <img src="flecha.png" alt="" />
        </div>
        <h2 className="text-lg font-semibold text-gray-700">
          Esperando Cálculo
        </h2>
        <p className="text-gray-400 text-sm mt-2">
          Completa el formulario y presiona "Calcular Precio Estimado"
        </p>
      </div>
    );
  }

  const min = result * 0.9;
  const max = result * 1.1;
  const fuelLabel = formData.fuel === "Petrol" ? "Gasolina" : "Diesel";
  const transmissionLabel = formData.transmission === "Automatic" ? "Automatico" : "Manual";

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        Resultado de la Predicción
      </h2>

      {/* PRECIO */}
      <div className="bg-gradient-to-r from-blue-400 to-purple-400 text-white p-5 rounded-xl mb-4">
        <p className="text-sm opacity-80">Precio Estimado</p>
        <p className="text-2xl font-bold">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(result)}
        </p>
        <p className="text-xs opacity-80 mt-1">
          Rango:{" "}
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(min)}{" "}
          -{" "}
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(max)}
        </p>
      </div>

      {/* DATOS */}
      <div className="space-y-2 text-sm">
        <div className="bg-blue-100 p-3 rounded-xl">
          <p className="text-xs text-gray-500">Marca</p>
          <p className="font-medium">{formData.brand}</p>
        </div>

        <div className="bg-blue-100 p-3 rounded-xl">
          <p className="text-xs text-gray-500">Año</p>
          <p className="font-medium">{formData.year}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-blue-100 p-3 rounded-xl">
            <p className="text-xs text-gray-500">Combustible</p>

            <p className="font-medium">{fuelLabel}</p>
          </div>

          <div className="bg-blue-100 p-3 rounded-xl">
            <p className="text-xs text-gray-500">Transmisión</p>
            <p className="font-medium">{transmissionLabel}</p>
          </div>

          <div className="bg-blue-100 p-3 rounded-xl">
            <p className="text-xs text-gray-500">Motor</p>
            <p className="font-medium">{formData.engine} cc</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-xl">
            <p className="text-xs text-gray-500">Consumo</p>
            <p className="font-medium">{formData.mileage} km/l</p>
          </div>
        </div>
      </div>
      <button className="w-full mt-4 p-3 rounded-xl bg-gradient-to-r from-orange-300 to-pink-400 text-white">
        Descargar Reporte PDF
      </button>

      <button
        onClick={clearResult}
        className="w-full mt-2 p-3 rounded-xl bg-gradient-to-r from-red-300 to-pink-400 text-white hover:scale-[1.02] transition"
      >
        Limpiar Resultado
      </button>
      <p className="text-xs text-gray-400 mt-4 text-center">
        * Esta es una estimación basada en datos simulados...
      </p>
    </div>
  );
}
