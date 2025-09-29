import React from "react";
import { useSelector } from 'react-redux';
import type { RootState } from "../../../store";
import type { Field, Block } from "../../../types";
import { getErrorForField } from "../../../utils/helpers";
import { BlockWrapper, PreviewLabel, SeparateBlockWrapper } from "../../../assets/Components.styled";

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
  
  // Separate inline and separate block children
  const inlineChildren = topLevelChildren.filter(c => !c.separateBlock);
  const separateChildren = topLevelChildren.filter(c => c.separateBlock);
  
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

  // Determine wrapper based on level and separateBlock
  const Wrapper = (level === 0 || field.separateBlock) ? BlockWrapper : React.Fragment;
  const wrapperProps = Wrapper === BlockWrapper ? {
    $level: level,
    $blockElement: field.blockElement,
    $separate: level === 0 ? block.separateBlock : false
  } : {};

  return (
    <>
      <Wrapper {...wrapperProps}>
        {field.label && (
          <PreviewLabel>
            {block.displayOrdering && typeof field.order === "number" && `${field.order}. `}
            {field.label}
          </PreviewLabel>
        )}

        {renderFieldByType()}
      </Wrapper>

      {/* Render top-level inline children if separateBlock is true */}
      {level === 0 && block.separateBlock && inlineChildren.length > 0 && (
        <BlockWrapper $level={level + 1} $separate={false}>
          {inlineChildren.map((child) => (
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

      {/* Render top-level separate block children */}
      {level === 0 && block.separateBlock && separateChildren.map((child) => (
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

export default PreviewRenderer;