import React from "react";
import type { Field } from "../features/types";

interface TextFieldProps {
  field: Field;
  value: string;
  onChange: (v: string) => void;
  showError: boolean;
}

const TextField: React.FC<TextFieldProps> = ({ field, value, onChange, showError }) => (
  <div>
    <label htmlFor={field.id}>{field.label}</label>
    <input
      id={field.id}
      type="text"
      value={value}
      placeholder={field.placeholder || ""}
      onChange={(e) => onChange(e.target.value)}
    />
    {showError && <span>{field.errorMessage || "This field is required."}</span>}
  </div>
);

export default TextField;
