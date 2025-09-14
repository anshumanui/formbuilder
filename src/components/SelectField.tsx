import React from "react";
import type { Field } from "../features/types";

interface SelectFieldProps {
  field: Field;
  value: string;
  onChange: (v: string) => void;
  showError: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({ field, value, onChange, showError }) => (
  <div>
    <label htmlFor={field.id}>{field.label}</label>
    <select
      id={field.id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">-- Select --</option>
      {(field.options || []).map(opt => (
        <option key={opt.id} value={opt.id}>{opt.value}</option>
      ))}
    </select>
    {showError && <span>{field.errorMessage || "This field is required."}</span>}
  </div>
);

export default SelectField;
