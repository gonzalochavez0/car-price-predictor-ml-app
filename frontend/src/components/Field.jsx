/**
 * Accessible labelled form control.
 *
 * Renders an `<input>` or a `<select>` depending on the `options` prop, while
 * keeping ids, labels and error messages consistent across the form.
 */
export default function Field({
  id,
  label,
  type = "number",
  value,
  onChange,
  options,
  min,
  max,
  step,
  placeholder,
  hint,
  error,
  disabled,
}) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;

  const controlProps = {
    id,
    name: id,
    value,
    onChange: (event) => onChange(event.target.value),
    disabled,
    "aria-invalid": error ? "true" : undefined,
    "aria-describedby": describedBy,
    className:
      "w-full mt-1 p-3 rounded-xl border bg-white outline-none transition " +
      (error
        ? "border-red-300 focus:ring-2 focus:ring-red-300"
        : "border-gray-200 focus:ring-2 focus:ring-purple-400"),
  };

  return (
    <div className="mb-4">
      <label htmlFor={id} className="text-sm text-gray-600">
        {label}
      </label>

      {options ? (
        <select {...controlProps}>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...controlProps}
          type={type}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          inputMode={type === "number" ? "decimal" : undefined}
        />
      )}

      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-gray-400 mt-1">
          {hint}
        </p>
      )}

      {error && (
        <p id={`${id}-error`} className="text-xs text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
