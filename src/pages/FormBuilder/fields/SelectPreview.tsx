import React from "react";
import type { Field, Block } from "../types";
import PreviewRenderer from "../PreviewRenderer";
import { ChildrenContainer, ErrorHelper, BlockWrapper } from "../../../assets/Main.styled";

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
  multiSelectValues: Record<string, string[]>;
  setSelectedOptions: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setCheckedOptions: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setMultiSelectValues: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
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
  multiSelectValues,
  setSelectedOptions,
  setCheckedOptions,
  setMultiSelectValues,
  error,
  renderChildrenInParent = false,
}) => {
  const value = fieldValues[field.id] || "";
  const selectedOpt = (field.options || []).find((opt) => opt.key === value);

  // Sort children based on order property
  const sortFieldsByOrder = (fields: Field[]): Field[] => {
    return [...fields].sort((a, b) => {
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  };

  const sortedChildren = selectedOpt?.children ? sortFieldsByOrder(selectedOpt.children) : [];

  return (
    <>
      <select
        value={value}
        onChange={(e) => {
          setFieldValues((prev) => ({ ...prev, [field.id]: e.target.value }));
          // Clear errors for this field when user makes selection
          setClearedFields(prev => ({ ...prev, [field.id]: true }));
        }}
      >
        <option value="">-- Select --</option>
        {(field.options || []).map((opt) => (
          <option key={opt.id} value={opt.key}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && <ErrorHelper>{error}</ErrorHelper>}

      {/* Only render children inline if NOT renderChildrenInParent */}
      {!renderChildrenInParent &&
        value && sortedChildren.length > 0 && (
        <ChildrenContainer placement={selectedOpt?.placement || "column"}>
          {sortedChildren.map((child) => (
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
                multiSelectValues={multiSelectValues}
                setSelectedOptions={setSelectedOptions}
                setCheckedOptions={setCheckedOptions}
                setFieldValues={setFieldValues}
                setClearedFields={setClearedFields}
                setMultiSelectValues={setMultiSelectValues}
              />
            </BlockWrapper>
          ))}
        </ChildrenContainer>
      )}
    </>
  );
};

export default SelectPreview;