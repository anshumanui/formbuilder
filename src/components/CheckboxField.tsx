import React from "react";
import type { Field } from "../features/types";

interface CheckboxFieldProps {
  field: Field;
  values: Record<string, boolean>; // optionId -> checked
  onChange: (optionId: string, checked: boolean) => void;
  showError: boolean;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({ field, values, onChange, showError }) => (
  <div>
    <label>{field.label}</label>
    {(field.options || []).map(opt => (
      <div key={opt.id}>
        <input
          type="checkbox"
          checked={!!values[opt.id]}
          onChange={(e) => onChange(opt.id, e.target.checked)}
        /> {opt.value}
      </div>
    ))}
    {showError && <span>{field.errorMessage || "This field is required."}</span>}
  </div>
);

export default CheckboxField;
