import React from "react";
import type { Field } from "../../../types";
import {
  InputLabel,
  TextInput,
  SelectInput,
} from "../../../assets/Components.styled";

interface Props {
  field: Field;
  onChange: (updated: Field) => void;
}

const InputFieldConfig: React.FC<Props> = ({ field, onChange }) => {
  const isInputField = field.type === "text" || field.type === "textarea" || field.type === "numeric";
  
  if (!isInputField) return null;

  return (
    <>
      <InputLabel>Placeholder</InputLabel>
      <TextInput
        value={field.placeholder || ""}
        onChange={(e) => onChange({ ...field, placeholder: e.target.value })}
      />

      <InputLabel>Icon</InputLabel>
      <TextInput 
        value={field.icon || ""} 
        onChange={(e) => onChange({ ...field, icon: e.target.value })} 
      />

      <InputLabel>Icon Alignment</InputLabel>
      <SelectInput
        value={field.iconAlignment || "left"}
        onChange={(e) => onChange({ 
          ...field, 
          iconAlignment: e.target.value as "left" | "right" 
        })}
      >
        <option value="left">Left</option>
        <option value="right">Right</option>
      </SelectInput>

      {field.type === "textarea" && (
        <>
          <InputLabel>Max Characters</InputLabel>
          <TextInput
            type="number"
            value={field.maxChars || ""}
            onChange={(e) => onChange({ 
              ...field, 
              maxChars: parseInt(e.target.value) || undefined 
            })}
          />
        </>
      )}

      {field.type === "numeric" && (
        <>
          <InputLabel>Decimal Points</InputLabel>
          <SelectInput
            value={field.decimalPoints || 0}
            onChange={(e) => onChange({ 
              ...field, 
              decimalPoints: parseInt(e.target.value) as 0 | 1 | 2 
            })}
          >
            <option value={0}>0</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
          </SelectInput>
        </>
      )}
    </>
  );
};

export default InputFieldConfig;