import React from "react";
import type { Field } from "../features/types";

interface NumericFieldProps {
  field: Field;
  value: string;
  onChange: (v: string) => void;
  showError: boolean;
}

const NumericField: React.FC<NumericFieldProps> = ({ field, value, onChange, showError }) => {
  const dp = field.decimalPoints ?? 0;
  const regexMap: Record<number, RegExp> = {
    0: /^\d*$/,
    1: /^\d*(\.\d{0,1})?$/,
    2: /^\d*(\.\d{0,2})?$/,
  };

  return (
    <div>
      <label htmlFor={field.id}>{field.label}</label>
      <input
        id={field.id}
        type="text"
        value={value}
        placeholder={field.placeholder || ""}
        onChange={(e) => {
          if (regexMap[dp].test(e.target.value)) onChange(e.target.value);
        }}
      />
      {showError && <span>{field.errorMessage || "This field is required."}</span>}
    </div>
  );
};

export default NumericField;
