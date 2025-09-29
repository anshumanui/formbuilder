import React from "react";
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../../../../store";
import { setSelectedOption, setClearedField } from "../../../../store/slices/formSlice";
import type { Field, Block } from "../../../../types";
import PreviewRenderer from "../PreviewRenderer";
import { 
  HelperText, 
  ChildrenContainer, 
  ErrorHelper, 
  OptionsContainer,
  OptionLabel,
  SeparateBlockWrapper
} from "../../../../assets/Components.styled";

interface Props {
  field: Field;
  block: Block;
  level?: number;
  error?: string | null;
  renderChildrenInParent?: boolean;
}

const RadioPreview: React.FC<Props> = ({
  field,
  block,
  level = 0,
  error,
  renderChildrenInParent = false,
}) => {
  const dispatch = useDispatch();
  const { selectedOptions } = useSelector((state: RootState) => state.form);

  // Sort children based on order property
  const sortFieldsByOrder = (fields: Field[]): Field[] => {
    return [...fields].sort((a, b) => {
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  };

  // Collect all separate block children from selected option
  const selectedOptionId = selectedOptions[field.id];
  const selectedOption = field.options?.find(opt => opt.id === selectedOptionId);
  const sortedChildren = selectedOption?.children ? sortFieldsByOrder(selectedOption.children) : [];
  const allSeparateChildren = sortedChildren.filter(c => c.separateBlock);

  return (
    <>
      <OptionsContainer $placement={field.optionsPlacement || "column"}>
        {(field.options || []).map((opt) => {
          const isSelected = selectedOptions[field.id] === opt.id;
          const sortedChildren = opt.children ? sortFieldsByOrder(opt.children) : [];
          
          // Only inline children
          const inlineChildren = sortedChildren.filter(c => !c.separateBlock);

          return (
            <div key={opt.id}>
              <OptionLabel $placement={field.optionsPlacement}>
                <input
                  type="radio"
                  name={field.id}
                  value={opt.key}
                  checked={isSelected}
                  onChange={() => {
                    dispatch(setSelectedOption({ fieldId: field.id, optionId: opt.id }));
                    dispatch(setClearedField({ fieldId: field.id }));
                  }}
                />
                {opt.label}
              </OptionLabel>

              {opt.helperText && level === 0 && <HelperText>{opt.helperText}</HelperText>}

              {/* Render inline children */}
              {!renderChildrenInParent && isSelected && inlineChildren.length > 0 && (
                <ChildrenContainer $placement={opt.placement || "column"}>
                  {inlineChildren.map((child) => (
                    <PreviewRenderer
                      key={child.id}
                      field={child}
                      block={block}
                      level={level + 1}
                      parentSelected={true}
                    />
                  ))}
                </ChildrenContainer>
              )}
            </div>
          );
        })}
      </OptionsContainer>
      {error && <ErrorHelper>{error}</ErrorHelper>}
      
      {/* Render all separate block children AFTER all options */}
      {!renderChildrenInParent && allSeparateChildren.map((child) => (
        <SeparateBlockWrapper key={child.id}>
          <PreviewRenderer
            field={child}
            block={block}
            level={level + 1}
            parentSelected={true}
          />
        </SeparateBlockWrapper>
      ))}
    </>
  );
};

export default RadioPreview;