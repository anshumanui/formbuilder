import React from "react";
import type { Field, Block } from "../types";
import PreviewRenderer from "../PreviewRenderer";
import { ChildrenContainer, ErrorHelper, BlockWrapper } from "../../../assets/Main.styled";

interface Props {
  field: Field;
  block: Block;
  level?: number;
  parentSelected?: boolean;
  multiSelectValues: Record<string, string[]>;
  setMultiSelectValues: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  setClearedFields: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  isSubmitted: boolean;
  selectedOptions: Record<string, string>;
  checkedOptions: Record<string, boolean>;
  fieldValues: Record<string, string>;
  clearedFields: Record<string, boolean>;
  setSelectedOptions: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setCheckedOptions: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setFieldValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  error?: string | null;
  renderChildrenInParent?: boolean;
}

const MultiSelectPreview: React.FC<Props> = ({
  field,
  block,
  level = 0,
  parentSelected = true,
  multiSelectValues,
  setMultiSelectValues,
  setClearedFields,
  isSubmitted,
  selectedOptions,
  checkedOptions,
  fieldValues,
  clearedFields,
  setSelectedOptions,
  setCheckedOptions,
  setFieldValues,
  error,
  renderChildrenInParent = false,
}) => {
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
    setMultiSelectValues((prev) => {
      const currentValues = prev[field.id] || [];
      let newValues: string[];
      
      if (isSelected) {
        // Add selection if not already present and within max limit
        if (!currentValues.includes(optionKey)) {
          if (field.maxSelections && currentValues.length >= field.maxSelections) {
            // If max selections reached, don't add more
            return prev;
          }
          newValues = [...currentValues, optionKey];
        } else {
          newValues = currentValues;
        }
      } else {
        // Remove selection
        newValues = currentValues.filter(val => val !== optionKey);
      }
      
      return { ...prev, [field.id]: newValues };
    });
    
    // Clear errors for this field when user makes selection
    setClearedFields(prev => ({ ...prev, [field.id]: true }));
  };

  // Get all selected options for rendering children
  const selectedOptionsForChildren = (field.options || []).filter(opt => 
    selectedValues.includes(opt.key)
  );

  return (
    <>
      <div style={{ 
        border: '1px solid #ccc', 
        borderRadius: '4px', 
        padding: '8px', 
        maxHeight: '200px', 
        overflowY: 'auto',
        backgroundColor: '#fff'
      }}>
        {(field.options || []).map((opt) => {
          const isSelected = selectedValues.includes(opt.key);
          const isDisabled = !!(field.maxSelections && 
                           selectedValues.length >= field.maxSelections && 
                           !isSelected);

          return (
            <label key={opt.id} style={{ 
              display: 'block', 
              marginBottom: '4px',
              opacity: isDisabled ? 0.5 : 1,
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              padding: '4px 0'
            }}>
              <input
                type="checkbox"
                checked={isSelected}
                disabled={isDisabled}
                onChange={(e) => handleSelectionChange(opt.key, e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              {opt.label}
            </label>
          );
        })}
        
        {field.maxSelections && (
          <div style={{ 
            fontSize: '12px', 
            color: '#666', 
            marginTop: '8px',
            borderTop: '1px solid #eee',
            paddingTop: '4px',
            textAlign: 'center'
          }}>
            {selectedValues.length} / {field.maxSelections} selected
          </div>
        )}
      </div>

      {error && <ErrorHelper>{error}</ErrorHelper>}

      {/* Only render children inline if NOT renderChildrenInParent */}
      {!renderChildrenInParent && selectedOptionsForChildren.length > 0 && (
        <ChildrenContainer placement="column">
          {selectedOptionsForChildren.map((selectedOpt) => {
            const sortedChildren = selectedOpt.children ? sortFieldsByOrder(selectedOpt.children) : [];
            
            return (
              sortedChildren.length > 0 && (
                <div key={selectedOpt.id} style={{ marginTop: '15px' }}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    marginBottom: '10px',
                    color: '#333',
                    fontSize: '14px'
                  }}>
                    {selectedOpt.label} Options:
                  </div>
                  <ChildrenContainer placement={selectedOpt.placement || "column"}>
                    {sortedChildren.map((child) => (
                      <BlockWrapper key={child.id} level={level + 1}>
                        <PreviewRenderer
                          field={child}
                          block={block}
                          level={level + 1}
                          parentSelected={parentSelected && selectedValues.length > 0}
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
                </div>
              )
            );
          })}
        </ChildrenContainer>
      )}
    </>
  );
};

export default MultiSelectPreview;