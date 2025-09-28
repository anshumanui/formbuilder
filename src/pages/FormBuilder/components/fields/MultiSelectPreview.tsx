import React from "react";
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../../../../store";
import { setMultiSelectValues, setClearedField } from "../../../../store/slices/formSlice";
import type { Field, Block } from "../../../../types";
import PreviewRenderer from "../PreviewRenderer";
import { 
  ChildrenContainer, 
  ErrorHelper, 
  BlockWrapper,
  MultiSelectContainer,
  MultiSelectLabel,
  MultiSelectCounter,
  MultiSelectInput,
  MultiSelectChildrenContainer,
  MultiSelectChildTitle
} from "../../../../assets/Components.styled";

interface Props {
  field: Field;
  block: Block;
  level?: number;
  parentSelected?: boolean;
  error?: string | null;
  renderChildrenInParent?: boolean;
}

const MultiSelectPreview: React.FC<Props> = ({
  field,
  block,
  level = 0,
  parentSelected = true,
  error,
  renderChildrenInParent = false,
}) => {
  const dispatch = useDispatch();
  const { multiSelectValues } = useSelector((state: RootState) => state.form);
  const selectedValues = multiSelectValues[field.id] || [];
  
  // Sort children based on order property
  const sortFieldsByOrder = (fields: Field[]): Field[] => {
    return [...fields].sort((a, b) => {
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  };
  
  const handleSelectionChange = (optionKey: string, isSelected: boolean) => {
    const currentValues = selectedValues;
    let newValues: string[];
    
    if (isSelected) {
      // Add selection if not already present and within max limit
      if (!currentValues.includes(optionKey)) {
        if (field.maxSelections && currentValues.length >= field.maxSelections) {
          // If max selections reached, don't add more
          return;
        }
        newValues = [...currentValues, optionKey];
      } else {
        newValues = currentValues;
      }
    } else {
      // Remove selection
      newValues = currentValues.filter(val => val !== optionKey);
    }
    
    dispatch(setMultiSelectValues({ fieldId: field.id, values: newValues }));
    dispatch(setClearedField({ fieldId: field.id }));
  };

  // Get all selected options for rendering children
  const selectedOptionsForChildren = (field.options || []).filter(opt => 
    selectedValues.includes(opt.key)
  );

  return (
    <>
      <MultiSelectContainer>
        {(field.options || []).map((opt) => {
          const isSelected = selectedValues.includes(opt.key);
          const isDisabled = !!(field.maxSelections && 
                           selectedValues.length >= field.maxSelections && 
                           !isSelected);

          return (
            <MultiSelectLabel 
              key={opt.id} 
              $disabled={isDisabled}
            >
              <MultiSelectInput
                type="checkbox"
                checked={isSelected}
                disabled={isDisabled}
                onChange={(e) => handleSelectionChange(opt.key, e.target.checked)}
              />
              {opt.label}
            </MultiSelectLabel>
          );
        })}
        
        {field.maxSelections && (
          <MultiSelectCounter>
            {selectedValues.length} / {field.maxSelections} selected
          </MultiSelectCounter>
        )}
      </MultiSelectContainer>

      {error && <ErrorHelper>{error}</ErrorHelper>}

      {/* Only render children inline if NOT renderChildrenInParent */}
      {!renderChildrenInParent && selectedOptionsForChildren.length > 0 && (
        <ChildrenContainer $placement="column">
          {selectedOptionsForChildren.map((selectedOpt) => {
            const sortedChildren = selectedOpt.children ? sortFieldsByOrder(selectedOpt.children) : [];
            
            return (
              sortedChildren.length > 0 && (
                <MultiSelectChildrenContainer key={selectedOpt.id}>
                  <MultiSelectChildTitle>
                    {selectedOpt.label} Options:
                  </MultiSelectChildTitle>
                  <ChildrenContainer $placement={selectedOpt.placement || "column"}>
                    {sortedChildren.map((child) => (
                      <BlockWrapper key={child.id} $level={level + 1}>
                        <PreviewRenderer
                          field={child}
                          block={block}
                          level={level + 1}
                          parentSelected={parentSelected && selectedValues.length > 0}
                        />
                      </BlockWrapper>
                    ))}
                  </ChildrenContainer>
                </MultiSelectChildrenContainer>
              )
            );
          })}
        </ChildrenContainer>
      )}
    </>
  );
};

export default MultiSelectPreview;