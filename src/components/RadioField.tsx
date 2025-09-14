import React from "react";
import type { Field } from "../features/types";

interface RadioFieldProps {
  field: Field;
  value: string; // selected optionId
  onChange: (optionId: string) => void;
  showError: boolean;
}

const RadioField: React.FC<RadioFieldProps> = ({ field, value, onChange, showError }) => (
  <div>
    <label>{field.label}</label>
    {(field.options || []).map(opt => (
      <div key={opt.id}>
        <input
          type="radio"
          name={field.id}
          value={opt.id}
          checked={value === opt.id}
          onChange={() => onChange(opt.id)}
        /> {opt.value}
      </div>
    ))}
    {showError && <span>{field.errorMessage || "This field is required."}</span>}
  </div>
);

export default RadioField;
