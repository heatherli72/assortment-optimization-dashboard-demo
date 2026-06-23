export interface MetricSwitchOption<T extends string> {
  value: T;
  label: string;
}

interface MetricSwitchProps<T extends string> {
  label: string;
  value: T;
  options: Array<MetricSwitchOption<T>>;
  onChange: (value: T) => void;
}

export function MetricSwitch<T extends string>({ label, value, options, onChange }: MetricSwitchProps<T>) {
  return (
    <div className="metric-switch" aria-label={label}>
      <span>{label}</span>
      <div>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
