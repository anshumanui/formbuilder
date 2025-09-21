import React from "react";
import type { Field, Block } from "./types";
import { getErrorForField } from "./helpers";
import {
  BlockWrapper,
  FieldContainer,
  PreviewLabel,
} from "../../assets/Main.styled";

import TextFieldPreview from "./fields/TextFieldPreview";
import TextareaPreview from "./fields/TextareaPreview";
import NumericFieldPreview from "./fields/NumericFieldPreview";
import SelectPreview from "./fields/SelectPreview";
import CheckboxPreview from "./fields/CheckboxPreview";
import RadioPreview from "./fields/RadioPreview";

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
  setSelectedOptions?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setCheckedOptions?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setFieldValues?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setClearedFields?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
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
  setSelectedOptions,
  setCheckedOptions,
  setFieldValues,
  setClearedFields,
}) => {
  const error = getErrorForField(
    field,
    parentSelected,
    isSubmitted,
    fieldValues,
    clearedFields,
    selectedOptions,
    checkedOptions
  );

  const renderChildren = (children?: Field[]) => {
    if (!children || children.length === 0) return null;

    // If top-level block has separateBlock = true, render in separate BlockWrapper
    if (level === 0 && block.separateBlock) {
      return (
        <BlockWrapper level={level + 1} separate>
          {children.map((child) => (
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
              setSelectedOptions={setSelectedOptions}
              setCheckedOptions={setCheckedOptions}
              setFieldValues={setFieldValues}
              setClearedFields={setClearedFields}
            />
          ))}
        </BlockWrapper>
      );
    }

    // Otherwise render children inside parent
    return (
      <FieldContainer level={level + 1}>
        {children.map((child) => (
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
            setSelectedOptions={setSelectedOptions}
            setCheckedOptions={setCheckedOptions}
            setFieldValues={setFieldValues}
            setClearedFields={setClearedFields}
          />
        ))}
      </FieldContainer>
    );
  };

  return (
    <BlockWrapper level={level}>
      {field.label && <PreviewLabel>{field.label}</PreviewLabel>}

      {field.type === "text" && fieldValues && setFieldValues && setClearedFields && (
        <TextFieldPreview
          field={field}
          block={block}
          fieldValues={fieldValues}
          setFieldValues={setFieldValues}
          setClearedFields={setClearedFields}
          error={error}
        />
      )}

      {field.type === "textarea" && fieldValues && setFieldValues && setClearedFields && (
        <TextareaPreview
          field={field}
          block={block}
          fieldValues={fieldValues}
          setFieldValues={setFieldValues}
          setClearedFields={setClearedFields}
          error={error}
        />
      )}

      {field.type === "numeric" && fieldValues && setFieldValues && setClearedFields && (
        <NumericFieldPreview
          field={field}
          block={block}
          fieldValues={fieldValues}
          setFieldValues={setFieldValues}
          setClearedFields={setClearedFields}
          error={error}
        />
      )}

      {field.type === "select" && (
        <SelectPreview
          field={field}
          block={block}
          level={level}
          fieldValues={fieldValues}
          setFieldValues={setFieldValues!}
          setClearedFields={setClearedFields!}
          isSubmitted={isSubmitted}
          selectedOptions={selectedOptions}
          checkedOptions={checkedOptions}
          clearedFields={clearedFields}
          setSelectedOptions={setSelectedOptions!}
          setCheckedOptions={setCheckedOptions!}
          error={error}
        />
      )}

      {field.type === "checkbox" && (
        <CheckboxPreview
          field={field}
          block={block}
          level={level}
          checkedOptions={checkedOptions}
          setCheckedOptions={setCheckedOptions!}
          setClearedFields={setClearedFields!}
          isSubmitted={isSubmitted}
          selectedOptions={selectedOptions}
          fieldValues={fieldValues}
          clearedFields={clearedFields}
          setSelectedOptions={setSelectedOptions!}
          setFieldValues={setFieldValues!}
          error={error}
        />
      )}

      {field.type === "radio" && (
        <RadioPreview
          field={field}
          block={block}
          level={level}
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions!}
          setClearedFields={setClearedFields!}
          isSubmitted={isSubmitted}
          checkedOptions={checkedOptions}
          fieldValues={fieldValues}
          clearedFields={clearedFields}
          setCheckedOptions={setCheckedOptions!}
          setFieldValues={setFieldValues!}
          error={error}
        />
      )}

      {/* Render children if any */}
      {renderChildren(
        field.options?.flatMap((opt) => opt.children ?? []).filter((c): c is Field => !!c)
      )}
    </BlockWrapper>
  );
};

export default PreviewRenderer;
