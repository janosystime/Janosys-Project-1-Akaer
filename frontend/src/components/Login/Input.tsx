import './Input.css';

interface InputProps {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

function Input({ label, type, placeholder, value, onChange, maxLength = 100 }: InputProps) {
  return (
    <div className="input-container">
      <label className="input-label">{label}</label>
      <input
        type={type}
        className="input-field"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
      />
    </div>
  );
}

export default Input;
