import React, { useState } from "react";
import TextField from "./components/TextField";
import TextAreaField from "./components/TextAreaField";
import NumericField from "./components/NumericField";
import SelectField from "./components/SelectField";
import CheckboxGroup from "./components/CheckboxField";
import RadioGroup from "./components/RadioField";
import { PreviewBlock, PreviewLabel, FieldContainer } from "./assets/Main.styled";

interface Option {
  id: string;
  value: string;
  placement?: "row" | "column";
  helperText?: string;
  children?: Field[];
}

interface Field {
  id: string;
  label?: string;
  type: "text" | "textarea" | "numeric" | "select" | "checkbox" | "radio";
  placeholder?: string;
  maxChars?: number;
  decimalPoints?: number;
  options?: Option[];
  mandatory?: boolean;
  errorMessage?: string;
  icon?: string;
  iconAlignment?: "left" | "right";
}

interface FormBuilderProps {
  fields: Field[];
}

const FormBuilder: React.FC<FormBuilderProps> = ({ fields }) => {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [checkedOptions, setCheckedOptions] = useState<Record<string, boolean>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [clearedFields, setClearedFields] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // --- Helper: error handling ---
  const getErrorForField = (
    field: Field,
    inheritedMandatory: boolean,
    parentSelected: boolean
  ): string | undefined => {
    if (
      !isSubmitted ||
      !inheritedMandatory ||
      !parentSelected ||
      clearedFields[field.id]
    ) {
      return undefined;
    }
    if (!fieldValues[field.id]) {
      return field.errorMessage;
    }
    return undefined;
  };

  const markFieldCleared = (id: string) => {
    setClearedFields((prev) => ({ ...prev, [id]: true }));
  };

  // --- Recursive render ---
  const renderPreview = (field: Field, level = 0, parentSelected = true): React.ReactNode => {
    const inheritedMandatory = field.mandatory ?? false;

    // --- TEXT ---
    if (field.type === "text") {
      return (
        <TextField
          field={field}
          value={fieldValues[field.id] || ""}
          error={getErrorForField(field, inheritedMandatory, parentSelected)}
          onChange={(val) => {
            setFieldValues((prev) => ({ ...prev, [field.id]: val }));
            setTouchedFields((prev) => ({ ...prev, [field.id]: true }));
            markFieldCleared(field.id);
          }}
        />
      );
    }

    // --- TEXTAREA ---
    if (field.type === "textarea") {
      return (
        <TextAreaField
          field={field}
          value={fieldValues[field.id] || ""}
          error={getErrorForField(field, inheritedMandatory, parentSelected)}
          onChange={(val) => {
            setFieldValues((prev) => ({ ...prev, [field.id]: val }));
            setTouchedFields((prev) => ({ ...prev, [field.id]: true }));
            markFieldCleared(field.id);
          }}
        />
      );
    }

    // --- NUMERIC ---
    if (field.type === "numeric") {
      return (
        <NumericField
          field={field}
          value={fieldValues[field.id] || ""}
          error={getErrorForField(field, inheritedMandatory, parentSelected)}
          onChange={(val) => {
            setFieldValues((prev) => ({ ...prev, [field.id]: val }));
            setTouchedFields((prev) => ({ ...prev, [field.id]: true }));
            markFieldCleared(field.id);
          }}
        />
      );
    }

    // --- SELECT ---
    if (field.type === "select") {
      return (
        <SelectField
          field={field}
          value={fieldValues[field.id] || ""}
          error={getErrorForField(field, inheritedMandatory, parentSelected)}
          onChange={(val) => {
            setFieldValues((prev) => ({ ...prev, [field.id]: val }));
            setTouchedFields((prev) => ({ ...prev, [field.id]: true }));
            markFieldCleared(field.id);
          }}
          renderChildren={(children, placement) =>
            children.map((child) => (
              <div key={child.id}>
                {renderPreview(child, level + 1, parentSelected)}
              </div>
            ))
          }
        />
      );
    }

    // --- CHECKBOX ---
    if (field.type === "checkbox") {
      return (
        <CheckboxGroup
          field={field}
          checkedOptions={checkedOptions}
          error={getErrorForField(field, inheritedMandatory, parentSelected)}
          onChange={(optId, checked) => {
            setCheckedOptions((prev) => ({ ...prev, [optId]: checked }));
            setTouchedFields((prev) => ({ ...prev, [field.id]: true }));
            markFieldCleared(field.id);
          }}
          renderChildren={(children, placement, optId) =>
            children.map((child) => (
              <div key={child.id}>
                {renderPreview(child, level + 1, checkedOptions[optId])}
              </div>
            ))
          }
        />
      );
    }

    // --- RADIO ---
    if (field.type === "radio") {
      return (
        <RadioGroup
          field={field}
          selectedOption={selectedOptions[field.id]}
          error={getErrorForField(field, inheritedMandatory, parentSelected)}
          onChange={(optId, value) => {
            setSelectedOptions((prev) => ({ ...prev, [field.id]: optId }));
            setFieldValues((prev) => ({ ...prev, [field.id]: value }));
            setTouchedFields((prev) => ({ ...prev, [field.id]: true }));
            markFieldCleared(field.id);
          }}
          renderChildren={(children, placement, optId) =>
            children.map((child) => (
              <div key={child.id}>
                {renderPreview(child, level + 1, selectedOptions[field.id] === optId)}
              </div>
            ))
          }
        />
      );
    }

    return null;
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setIsSubmitted(true);
      }}
    >
      {fields.map((field) => (
        <div key={field.id}>{renderPreview(field)}</div>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
};

export default FormBuilder;
