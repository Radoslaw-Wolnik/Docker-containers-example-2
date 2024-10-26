interface SortingControlsProps<T> {
    options: Array<{
      label: string;
      value: keyof T;
    }>;
    value: keyof T;
    direction: 'asc' | 'desc';
    onChange: (value: keyof T, direction: 'asc' | 'desc') => void;
  }
  
  export function SortingControls<T>({
    options,
    value,
    direction,
    onChange
  }: SortingControlsProps<T>) {
    return (
      <div className="flex items-center space-x-4">
        <select
          value={String(value)}
          onChange={(e) => onChange(e.target.value as keyof T, direction)}
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {options.map((option) => (
            <option key={String(option.value)} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => onChange(value, direction === 'asc' ? 'desc' : 'asc')}
          className="p-2 border rounded-md hover:bg-gray-50"
        >
          {direction === 'asc' ? '↑' : '↓'}
        </button>
      </div>
    );
  }
  