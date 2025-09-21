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
  setSelectedOptions: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setFieldValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
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
  setSelectedOptions,
  setFieldValues,
  error,
  renderChildrenInParent = false,
}) => {
  return (
    <>
      {(field.options || []).map((opt) => {
        const isChecked = !!checkedOptions[opt.id];

        return (
          <OptionWrapper key={opt.id}>
            <label>
              <input
                type="checkbox"
                name={field.id}
                value={opt.value}
                checked={isChecked}
                onChange={() => {
                  setCheckedOptions((prev) => ({
                    ...prev,
                    [opt.id]: !prev[opt.id],
                  }));
                  setClearedFields({});
                }}
              />{" "}
              {opt.value}
            </label>

            {/* Only render children inline if NOT renderChildrenInParent */}
            {!renderChildrenInParent &&
              isChecked && (opt.children?.length ?? 0) > 0 && (
              <ChildrenContainer placement={opt.placement || "column"}>
                {opt.children!.map((child) => (
                  <OptionContainer key={child.id}>
                    <PreviewRenderer
                      field={child}
                      block={block}
                      level={level + 1}
                      parentSelected={isChecked}
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
                  </OptionContainer>
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