// src/pages/FormBuilder/components/fields/RadioPreview.tsx (Updated)
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
  SeparateBlockWrapper,
  FieldWrapper
} from "../../../../assets/Components.styled";
import styled from "styled-components";

const SharedChildIndicator = styled.div`
  background: #e3f2fd;
  border-left: 3px solid #2196f3;
  padding: 8px 12px;
  margin: 8px 0;
  font-size: 12px;
  color: #1565c0;
  border-radius: 2px;
`;

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

  // Detect shared children (same child ID across multiple options)
  const getSharedChildIds = (): Set<string> => {
    const childIdMap: Record<string, number> = {};
    (field.options || []).forEach((opt) => {
      (opt.children || []).forEach((child) => {
        childIdMap[child.id] = (childIdMap[child.id] || 0) + 1;
      });
    });

    return new Set(
      Object.entries(childIdMap)
        .filter(([, count]) => count > 1)
        .map(([id]) => id)
    );
  };

  const sharedChildIds = getSharedChildIds();

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
                    <FieldWrapper key={child.id} $blockElement={child.blockElement}>
                      {sharedChildIds.has(child.id) && (
                        <SharedChildIndicator>
                          🔗 This field is shared with other options. Changes will apply to all.
                        </SharedChildIndicator>
                      )}
                      <PreviewRenderer
                        field={child}
                        block={block}
                        level={level + 1}
                        parentSelected={true}
                      />
                    </FieldWrapper>
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
          {sharedChildIds.has(child.id) && (
            <SharedChildIndicator>
              🔗 This field is shared with other options. Changes will apply to all.
            </SharedChildIndicator>
          )}
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