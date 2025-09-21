import React from "react";
import type { Field, Block } from "../types";
import { ErrorHelper, FlexRow, SmallIcon } from "../../../assets/Main.styled";

interface Props {
  field: Field;
  block: Block;
  fieldValues: Record<string, string>;
  setFieldValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setClearedFields: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  error?: string | null;
}

const TextFieldPreview: React.FC<Props> = ({
  field,
  block: _block,
  fieldValues,
  setFieldValues,
  setClearedFields,
  error,
}) => (
  <FlexRow>
    {field.icon && field.iconAlignment === "left" && <SmallIcon>{field.icon}</SmallIcon>}
    <input
      placeholder={field.placeholder}
      maxLength={field.maxChars}
      value={fieldValues[field.id] || ""}
      onChange={(e) => {
        setFieldValues((prev) => ({ ...prev, [field.id]: e.target.value }));
        setClearedFields((prev) => ({ ...prev, [field.id]: true }));
      }}
    />
    {field.icon && field.iconAlignment === "right" && <SmallIcon>{field.icon}</SmallIcon>}
    {error && <ErrorHelper>{error}</ErrorHelper>}
  </FlexRow>
);

export default TextFieldPreview;
