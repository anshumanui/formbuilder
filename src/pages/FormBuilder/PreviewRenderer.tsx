import React from "react";
import type { Field, Block } from "./types";
import { getErrorForField } from "./helpers";
import { BlockWrapper, PreviewLabel } from "../../assets/Main.styled";

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
  isSubmitted: boolean;
  selectedOptions: Record<string, string>;
  checkedOptions: Record<string, boolean>;
  fieldValues: Record<string, string>;
  clearedFields: Record<string, boolean>;
  multiSelectValues: Record<string, string[]>;
  setSelectedOptions?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setCheckedOptions?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setFieldValues?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setClearedFields?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setMultiSelectValues?: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
}

const PreviewRenderer: React.FC<Props> = ({
  field,
  block,
  level = 0,
  parentSelected = true,
  isSubmitted,
  selectedOptions,
  checkedOptions,
  fieldValues,
  clearedFields,
  multiSelectValues,
  setSelectedOptions,
  setCheckedOptions,
  setFieldValues,
  setClearedFields,
  setMultiSelectValues,
}) => {
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
    isSubmitted,
    selectedOptions,
    checkedOptions,
    fieldValues,
    clearedFields,
    multiSelectValues,
    setSelectedOptions: setSelectedOptions!,
    setCheckedOptions: setCheckedOptions!,
    setFieldValues: setFieldValues!,
    setClearedFields: setClearedFields!,
    setMultiSelectValues: setMultiSelectValues!,
    error,
    renderChildrenInParent: level === 0 && block.separateBlock,
  };

  const renderFieldByType = () => {
    switch (field.type) {
      case "text":
        return fieldValues && setFieldValues && setClearedFields && (
          <TextFieldPreview
            field={field}
            block={block}
            fieldValues={fieldValues}
            setFieldValues={setFieldValues}
            setClearedFields={setClearedFields}
            error={error}
          />
        );

      case "textarea":
        return fieldValues && setFieldValues && setClearedFields && (
          <TextareaPreview
            field={field}
            block={block}
            fieldValues={fieldValues}
            setFieldValues={setFieldValues}
            setClearedFields={setClearedFields}
            error={error}
          />
        );

      case "numeric":
        return fieldValues && setFieldValues && setClearedFields && (
          <NumericFieldPreview
            field={field}
            block={block}
            fieldValues={fieldValues}
            setFieldValues={setFieldValues}
            setClearedFields={setClearedFields}
            error={error}
          />
        );

      case "select":
        return <SelectPreview {...commonProps} />;

      case "checkbox":
        return <CheckboxPreview {...commonProps} />;

      case "radio":
        return <RadioPreview {...commonProps} />;

      case "multiselect":
        return multiSelectValues && setMultiSelectValues && (
          <MultiSelectPreview
            {...commonProps}
            parentSelected={parentSelected}
            multiSelectValues={multiSelectValues}
            setMultiSelectValues={setMultiSelectValues}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <BlockWrapper 
        level={level} 
        blockElement={field.blockElement}
        separate={level === 0 && block.separateBlock}
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
        <BlockWrapper level={level + 1} separate>
          {topLevelChildren.map((child) => (
            <PreviewRenderer
              key={child.id}
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
          ))}
        </BlockWrapper>
      )}
    </>
  );
};

export default PreviewRenderer;