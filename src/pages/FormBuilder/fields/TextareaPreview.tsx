import React from "react";
import type { Field, Block } from "../types";
import { RelativeTextareaWrapper, CharCounter, ErrorHelper } from "../../../assets/Main.styled";

interface Props {
  field: Field;
  block: Block;
  fieldValues: Record<string, string>;
  setFieldValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setClearedFields: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  error?: string | null;
}

const TextareaPreview: React.FC<Props> = ({
  field,
  block: _block,
  fieldValues,
  setFieldValues,
  setClearedFields,
  error,
}) => {
  const value = fieldValues[field.id] || "";

  return (
    <RelativeTextareaWrapper>
      <textarea
        placeholder={field.placeholder}
        maxLength={field.maxChars}
        value={value}
        onChange={(e) => {
          const newValue = e.target.value;
          if (!field.maxChars || newValue.length <= field.maxChars) {
            setFieldValues((prev) => ({ ...prev, [field.id]: newValue }));
            setClearedFields((prev) => ({ ...prev, [field.id]: true }));
          }
        }}
        style={{ width: "100%", minHeight: 100, paddingBottom: 20 }}
      />
      {field.maxChars && <CharCounter>{value.length} / {field.maxChars}</CharCounter>}
      {error && <ErrorHelper>{error}</ErrorHelper>}
    </RelativeTextareaWrapper>
  );
};

export default TextareaPreview;