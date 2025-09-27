import React from "react";
import type { Field, Block, Option } from "../types";
import PreviewRenderer from "../PreviewRenderer";
import {
  OptionWrapper,
  ErrorHelper,
  ChildrenContainer,
  OptionContainer,
} from "../../../assets/Main.styled";

interface Props {
  field: Field;
  block: Block;
  level?: number;
  checkedOptions: Record<string, boolean>;
  setCheckedOptions: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setClearedFields: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  isSubmitted: boolean;
  selectedOptions: Record<string, string>;
  fieldValues: Record<string, string>;
  clearedFields: Record<string, boolean>;
  multiSelectValues: Record<string, string[]>;
  setSelectedOptions: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setFieldValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setMultiSelectValues: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  error?: string | null;
  renderChildrenInParent?: boolean;
}

const CheckboxPreview: React.FC<Props> = ({
  field,
  block,
  level = 0,
  checkedOptions,
  setCheckedOptions,
  setClearedFields,
  isSubmitted,
  selectedOptions,
  fieldValues,
  clearedFields,
  multiSelectValues,
  setSelectedOptions,
  setFieldValues,
  setMultiSelectValues,
  error,
  renderChildrenInParent = false,
}) => {
  // Sort children based on order property
  const sortFieldsByOrder = (fields: Field[]): Field[] => {
    return [...fields].sort((a, b) => {
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  };

  return (
    <>
      {(field.options || []).map((opt) => {
        const isChecked = !!checkedOptions[opt.id];
        const sortedChildren = opt.children ? sortFieldsByOrder(opt.children) : [];

        return (
          <OptionWrapper key={opt.id}>
            <label>
              <input
                type="checkbox"
                name={field.id}
                value={opt.key}
                checked={isChecked}
                onChange={() => {
                  setCheckedOptions((prev) => ({
                    ...prev,
                    [opt.id]: !prev[opt.id],
                  }));
                  // Clear errors for this field when user makes selection
                  setClearedFields(prev => ({ ...prev, [field.id]: true }));
                }}
              />{" "}
              {opt.label}
            </label>

            {/* Only render children inline if NOT renderChildrenInParent */}
            {!renderChildrenInParent &&
              isChecked && sortedChildren.length > 0 && (
              <ChildrenContainer placement={opt.placement || "column"}>
                {sortedChildren.map((child) => (
                  <PreviewRenderer
                    key={child.id}
                    field={child}
                    block={block}
                    level={level + 1}
                    parentSelected={isChecked}
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
                ))}
              </ChildrenContainer>
            )}
          </OptionWrapper>
        );
      })}
      {error && <ErrorHelper>{error}</ErrorHelper>}
    </>
  );
};

export default CheckboxPreview;