import React from "react";
import type { Field, Block } from "../types";
import PreviewRenderer from "../PreviewRenderer";
import { OptionWrapper, HelperText, ChildrenContainer, OptionContainer, ErrorHelper, BlockWrapper } from "../../../assets/Main.styled";

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
  setCheckedOptions: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setFieldValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  error?: string | null;
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
  setCheckedOptions,
  setFieldValues,
  error,
}) => (
  <>
    {(field.options || []).map((opt) => {
      const isSelected = selectedOptions[field.id] === opt.id;

      return (
        <OptionWrapper key={opt.id}>
          <label>
            <input
              type="radio"
              name={field.id}
              value={opt.value}
              checked={isSelected}
              onChange={() => {
                setSelectedOptions((prev) => ({ ...prev, [field.id]: opt.id }));
                setClearedFields({});
              }}
            />
            {opt.value}
          </label>

          {opt.helperText && <HelperText>{opt.helperText}</HelperText>}

          {selectedOptions[field.id] === opt.id &&
            (opt.children ?? []).length > 0 && (
                <ChildrenContainer placement={opt.placement || "column"}>
                {(opt.children ?? []).map((child) => (
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
                        setSelectedOptions={setSelectedOptions}
                        setCheckedOptions={setCheckedOptions}
                        setFieldValues={setFieldValues}
                        setClearedFields={setClearedFields}
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

export default RadioPreview;
