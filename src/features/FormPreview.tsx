import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { type RootState } from "../app/store";
import TextField from "../components/TextField";
import TextAreaField from "../components/TextAreaField";
import NumericField from "../components/NumericField";
import SelectField from "../components/SelectField";
import CheckboxField from "../components/CheckboxField";
import RadioField from "../components/RadioField";
import {
  setFieldValue,
  setSelectedOption,
  setCheckedOption,
  setIsSubmitted,
} from "../features/formSlice";
import {
  PreviewBlock,
  PreviewLabel,
  ChildrenContainer,
  ErrorHelper,
  Button as StyledButton,
} from "../assets/Main.styled";
import type { Field, Option } from "../features/types";

const FormPreview: React.FC = () => {
  const dispatch = useDispatch();

  const block = useSelector((state: RootState) => state.form.block);
  const fieldValues = useSelector((state: RootState) => state.form.fieldValues);
  const selectedOptions = useSelector(
    (state: RootState) => state.form.selectedOptions
  );
  const checkedOptions = useSelector(
    (state: RootState) => state.form.checkedOptions
  );
  const isSubmitted = useSelector((state: RootState) => state.form.isSubmitted);

  const handleSubmit = () => {
    dispatch(setIsSubmitted(true));
  };

  const renderField = (field: Field) => {
    const value = fieldValues[field.id] || "";
    const showError = isSubmitted && field.mandatory && !value;

    switch (field.type) {
      case "text":
        return (
          <TextField
            key={field.id}
            field={field}
            value={value}
            onChange={(v) =>
              dispatch(setFieldValue({ fieldId: field.id, value: v }))
            }
            showError={!!showError}
          />
        );

      case "textarea":
        return (
          <TextAreaField
            key={field.id}
            field={field}
            value={value}
            onChange={(v) =>
              dispatch(setFieldValue({ fieldId: field.id, value: v }))
            }
            showError={!!showError}
          />
        );

      case "numeric":
        return (
          <NumericField
            key={field.id}
            field={field}
            value={value}
            onChange={(v) =>
              dispatch(setFieldValue({ fieldId: field.id, value: v }))
            }
            showError={!!showError}
          />
        );

      case "select":
        return (
          <SelectField
            key={field.id}
            field={field}
            value={value}
            onChange={(v) =>
              dispatch(setFieldValue({ fieldId: field.id, value: v }))
            }
            showError={!!showError}
          />
        );

      case "checkbox":
        return (
          <CheckboxField
            key={field.id}
            field={field}
            values={checkedOptions[field.id] || {}}
            onChange={(optionId, checked) =>
              dispatch(
                setCheckedOption({ fieldId: field.id, optionId, value: checked })
              )
            }
            showError={!!showError}
          />
        );

      case "radio":
        return (
          <RadioField
            key={field.id}
            field={field}
            value={selectedOptions[field.id] || ""}
            onChange={(optionId) =>
              dispatch(setSelectedOption({ fieldId: field.id, optionId }))
            }
            showError={!!showError}
          />
        );

      default:
        return null;
    }
  };

  const renderChildren = (parentField: Field, options?: Option[]) => {
    if (!options) return null;

    return options.map((opt) => {
      const isRadioSelected =
        parentField.type === "radio" &&
        selectedOptions[parentField.id] === opt.id;
      const isCheckboxChecked =
        parentField.type === "checkbox" &&
        checkedOptions[parentField.id]?.[opt.id];

      if ((isRadioSelected || isCheckboxChecked) && opt.children?.length) {
        return (
          <ChildrenContainer
            key={opt.id}
            placement={opt.placement || "column"}
          >
            {opt.children.map((child) => (
              <PreviewBlock key={child.id}>
                <PreviewLabel mandatory={child.mandatory}>
                  {child.label}
                </PreviewLabel>
                {renderField(child)}
                {renderChildren(child, child.options)}
              </PreviewBlock>
            ))}
          </ChildrenContainer>
        );
      }
      return null;
    });
  };

  return (
    <div>
      <h2>Form Preview</h2>
      <PreviewBlock>
        <PreviewLabel mandatory={block.field.mandatory}>
          {block.field.label}
        </PreviewLabel>
        {renderField(block.field)}
        {renderChildren(block.field, block.field.options)}
      </PreviewBlock>

      <StyledButton onClick={handleSubmit}>Submit</StyledButton>
    </div>
  );
};

export default FormPreview;
