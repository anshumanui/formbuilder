import React from "react";
import type { Field } from "../features/types";

interface TextAreaFieldProps {
  field: Field;
  value: string;
  onChange: (v: string) => void;
  showError: boolean;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({ field, value, onChange, showError }) => (
  <div>
    <label htmlFor={field.id}>{field.label}</label>
    <textarea
      id={field.id}
      value={value}
      placeholder={field.placeholder || ""}
      maxLength={field.maxChars}
      onChange={(e) => onChange(e.target.value)}
    />
    {field.maxChars && <small>{value.length}/{field.maxChars}</small>}
    {showError && <span>{field.errorMessage || "This field is required."}</span>}
  </div>
);

export default TextAreaField;
