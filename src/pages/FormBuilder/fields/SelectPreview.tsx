import React from "react";
import type { Field, Block } from "../types";
import PreviewRenderer from "../PreviewRenderer";
import { ChildrenContainer, OptionContainer, ErrorHelper, BlockWrapper } from "../../../assets/Main.styled";

interface Props {
  field: Field;
  block: Block;
  level?: number;
  parentSelected?: boolean;
  fieldValues: Record<string, string>;
  setFieldValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setClearedFields: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  isSubmitted: boolean;
  selectedOptions: Record<string, string>;
  checkedOptions: Record<string, boolean>;
  clearedFields: Record<string, boolean>;
  setSelectedOptions: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setCheckedOptions: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  error?: string | null;
  renderChildrenInParent?: boolean;
}

const SelectPreview: React.FC<Props> = ({
  field,
  block,
  level = 0,
  parentSelected = true,
  fieldValues,
  setFieldValues,
  setClearedFields,
  isSubmitted,
  selectedOptions,
  checkedOptions,
  clearedFields,
  setSelectedOptions,
  setCheckedOptions,
  error,
  renderChildrenInParent = false,
}) => {
  const value = fieldValues[field.id] || "";
  const selectedOpt = (field.options || []).find((opt) => opt.value === value);

  return (
    <>
      <select
        value={value}
        onChange={(e) => {
          setFieldValues((prev) => ({ ...prev, [field.id]: e.target.value }));
          setClearedFields({});
        }}
      >
        <option value="">-- Select --</option>
        {(field.options || []).map((opt) => (
          <option key={opt.id} value={opt.value}>
            {opt.value}
          </option>
        ))}
      </select>

      {error && <ErrorHelper>{error}</ErrorHelper>}

      {/* Only render children inline if NOT renderChildrenInParent */}
      {!renderChildrenInParent &&
        value && (selectedOpt?.children ?? []).length > 0 && (
        <ChildrenContainer placement={selectedOpt?.placement || "column"}>
          {(selectedOpt?.children ?? []).map((child) => (
            <BlockWrapper key={child.id} level={level + 1}>
              <PreviewRenderer
                field={child}
                block={block}
                level={level + 1}
                parentSelected={parentSelected && !!value}
                isSubmitted={isSubmitted}
                selectedOptions={selectedOptions}
                checkedOptions={checkedOptions}
                fieldValues={fieldValues}
                clearedFields={clearedFields}
                setSelectedOptions={setSelectedOptions}
                setCheckedOptions={setCheckedOptions}
                setFieldValues={setFieldValues}
                setClearedFields={setClearedFields}
              />
            </BlockWrapper>
          ))}
        </ChildrenContainer>
      )}
    </>
  );
};

export default SelectPreview;