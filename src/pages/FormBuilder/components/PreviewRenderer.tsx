import React from "react";
import { useSelector } from 'react-redux';
import type { RootState } from "../../../store";
import type { Field, Block } from "../../../types";
import { getErrorForField } from "../../../utils/helpers";
import { BlockWrapper, PreviewLabel } from "../../../assets/Components.styled";

import TextFieldPreview from "./fields/TextFieldPreview";
import TextareaPreview from "./fields/TextareaPreview";
import NumericFieldPreview from "./fields/NumericFieldPreview";
import SelectPreview from "./fields/SelectPreview";
import CheckboxPreview from "./fields/CheckboxPreview";
import RadioPreview from "./fields/RadioPreview";
import MultiSelectPreview from "./fields/MultiSelectPreview";

interface Props {
  field: Field;
  block: Block;
  level?: number;
  parentSelected?: boolean;
}

const PreviewRenderer: React.FC<Props> = ({
  field,
  block,
  level = 0,
  parentSelected = true,
}) => {
  const {
    isSubmitted,
    selectedOptions,
    checkedOptions,
    fieldValues,
    clearedFields,
    multiSelectValues
  } = useSelector((state: RootState) => state.form);

  const error = getErrorForField(
    field,
    parentSelected,
    isSubmitted,
    fieldValues,
    clearedFields,
    selectedOptions,
    checkedOptions,
    multiSelectValues
  );

  // Sort children based on order property
  const sortFieldsByOrder = (fields: Field[]): Field[] => {
    return [...fields].sort((a, b) => {
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  };

  // Get children from selected options for top-level fields
  const getTopLevelChildren = () => {
    if (level !== 0) return [];
    
    let children: Field[] = [];
    
    if (field.type === "radio") {
      const selectedOptionId = selectedOptions[field.id];
      const selectedOption = field.options?.find(opt => opt.id === selectedOptionId);
      children = selectedOption?.children || [];
    }
    else if (field.type === "checkbox") {
      children = field.options?.flatMap(opt => 
        checkedOptions[opt.id] ? (opt.children || []) : []
      ) || [];
    }
    else if (field.type === "select") {
      const selectedValue = fieldValues[field.id];
      const selectedOption = field.options?.find(opt => opt.key === selectedValue);
      children = selectedOption?.children || [];
    }
    else if (field.type === "multiselect") {
      const selectedValues = multiSelectValues[field.id] || [];
      children = field.options?.flatMap(opt => 
        selectedValues.includes(opt.key) ? (opt.children || []) : []
      ) || [];
    }
    
    return sortFieldsByOrder(children);
  };

  const topLevelChildren = getTopLevelChildren();
  const commonProps = {
    field,
    block,
    level,
    error,
    renderChildrenInParent: level === 0 && block.separateBlock,
  };

  const renderFieldByType = () => {
    switch (field.type) {
      case "text":
        return <TextFieldPreview {...commonProps} />;

      case "textarea":
        return <TextareaPreview {...commonProps} />;

      case "numeric":
        return <NumericFieldPreview {...commonProps} />;

      case "select":
        return <SelectPreview {...commonProps} />;

      case "checkbox":
        return <CheckboxPreview {...commonProps} />;

      case "radio":
        return <RadioPreview {...commonProps} />;

      case "multiselect":
        return <MultiSelectPreview {...commonProps} parentSelected={parentSelected} />;

      default:
        return null;
    }
  };

  return (
    <>
      <BlockWrapper 
        $level={level} 
        $blockElement={field.blockElement}
        $separate={level === 0 && block.separateBlock}
      >
        {field.label && (
          <PreviewLabel>
            {block.displayOrdering && typeof field.order === "number" && `${field.order}. `}
            {field.label}
          </PreviewLabel>
        )}

        {renderFieldByType()}
      </BlockWrapper>

      {/* Render top-level children separately if separateBlock is true */}
      {level === 0 && block.separateBlock && topLevelChildren.length > 0 && (
        <BlockWrapper $level={level + 1} $separate>
          {topLevelChildren.map((child) => (
            <PreviewRenderer
              key={child.id}
              field={child}
              block={block}
              level={level + 1}
              parentSelected={true}
            />
          ))}
        </BlockWrapper>
      )}
    </>
  );
};

export default PreviewRenderer;