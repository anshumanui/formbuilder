import React from "react";
import type { Field } from "../../../types";
import { generateKeyFromLabel } from "../../../utils/helpers";
import {
  InputLabel,
  TextInput,
  SelectInput,
  CheckboxInput,
} from "../../../assets/Components.styled";

interface Props {
  field: Field;
  onChange: (updated: Field) => void;
}

const FieldConfig: React.FC<Props> = ({ field, onChange }) => {
  // Check if field type supports options placement
  const hasOptionsPlacement = field.type === "radio" || field.type === "checkbox";

  return (
    <>
      {/* Label */}
      <InputLabel>Field Label</InputLabel>
      <TextInput
        value={field.label}
        onChange={(e) => onChange({ 
          ...field, 
          label: e.target.value, 
          key: generateKeyFromLabel(e.target.value) 
        })}
      />

      {/* Order */}
      <InputLabel>Order</InputLabel>
      <TextInput
        type="number"
        value={field.order || ""}
        onChange={(e) => onChange({ 
          ...field, 
          order: e.target.value ? parseInt(e.target.value) : undefined 
        })}
        placeholder="Field display order (optional)"
        min="1"
      />

      {/* NEW: Options Placement - Only for radio and checkbox */}
      {hasOptionsPlacement && (
        <>
          <InputLabel>Options Placement</InputLabel>
          <SelectInput
            value={field.optionsPlacement || "column"}
            onChange={(e) => onChange({ 
              ...field, 
              optionsPlacement: e.target.value as "row" | "column" 
            })}
          >
            <option value="column">Column</option>
            <option value="row">Row</option>
          </SelectInput>
        </>
      )}

      {/* Field Type */}
      <InputLabel>Field Type</InputLabel>
      <SelectInput 
        value={field.type} 
        onChange={(e) => onChange({ ...field, type: e.target.value as any })}
      >
        <option value="text">Text</option>
        <option value="textarea">Textarea</option>
        <option value="numeric">Numeric</option>
        <option value="radio">Radio</option>
        <option value="checkbox">Checkbox</option>
        <option value="select">Select</option>
        <option value="multiselect">Multi-Select</option>
      </SelectInput>

      {/* Mandatory */}
      <label>
        <CheckboxInput
          type="checkbox"
          checked={field.mandatory || false}
          onChange={(e) => onChange({ ...field, mandatory: e.target.checked })}
        />
        Mandatory Field
      </label>

      {/* Block Element */}
      <label>
        <CheckboxInput
          type="checkbox"
          checked={field.blockElement || false}
          onChange={(e) => onChange({ ...field, blockElement: e.target.checked })}
        />
        Block Element (Full Width)
      </label>

      {/* Custom Error Message */}
      {field.mandatory && (
        <>
          <InputLabel>Custom Error Message (optional)</InputLabel>
          <TextInput
            value={field.errorMessage || ""}
            onChange={(e) => onChange({ ...field, errorMessage: e.target.value })}
            placeholder="This field is required"
          />
        </>
      )}
    </>
  );
};

export default FieldConfig;