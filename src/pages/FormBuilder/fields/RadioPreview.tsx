import React from "react";
import type { Field, Block } from "../types";
import PreviewRenderer from "../PreviewRenderer";
import { OptionWrapper, HelperText, ChildrenContainer, ErrorHelper, BlockWrapper } from "../../../assets/Main.styled";

interface Props {
  field: Field;
  block: Block;
  level?: number;
  parentSelected?: boolean;
  selectedOptions: Record<string, string>;
  setSelectedOptions: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setClearedFields: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  isSubmitted: boolean;
  checkedOptions: Record<string, boolean>;
  fieldValues: Record<string, string>;
  clearedFields: Record<string, boolean>;
  multiSelectValues: Record<string, string[]>;
  setCheckedOptions: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setFieldValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setMultiSelectValues: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  error?: string | null;
  renderChildrenInParent?: boolean;
}

const RadioPreview: React.FC<Props> = ({
  field,
  block,
  level = 0,
  parentSelected: _parentSelected,
  selectedOptions,
  setSelectedOptions,
  setClearedFields,
  isSubmitted,
  checkedOptions,
  fieldValues,
  clearedFields,
  multiSelectValues,
  setCheckedOptions,
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
        const isSelected = selectedOptions[field.id] === opt.id;
        const sortedChildren = opt.children ? sortFieldsByOrder(opt.children) : [];

        return (
          <OptionWrapper key={opt.id}>
            <label>
              <input
                type="radio"
                name={field.id}
                value={opt.key}
                checked={isSelected}
                onChange={() => {
                  setSelectedOptions((prev) => ({ ...prev, [field.id]: opt.id }));
                  // Clear errors for this field when user makes selection
                  setClearedFields(prev => ({ ...prev, [field.id]: true }));
                }}
              />
              {opt.label}
            </label>

            {opt.helperText && level === 0 && <HelperText>{opt.helperText}</HelperText>}

            {/* Only render children inline if NOT renderChildrenInParent */}
            {!renderChildrenInParent &&
              selectedOptions[field.id] === opt.id &&
              sortedChildren.length > 0 && (
                <ChildrenContainer placement={opt.placement || "column"}>
                  {sortedChildren.map((child) => (
                    <BlockWrapper key={child.id} level={level + 1}>
                      <PreviewRenderer
                        field={child}
                        block={block}
                        level={level + 1}
                        parentSelected={true}
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
          </OptionWrapper>
        );
      })}
      {error && <ErrorHelper>{error}</ErrorHelper>}
    </>
  );
};

export default RadioPreview;