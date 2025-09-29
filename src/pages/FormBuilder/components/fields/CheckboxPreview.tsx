import React from "react";
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../../../../store";
import { setCheckedOption, setClearedField } from "../../../../store/slices/formSlice";
import type { Field, Block } from "../../../../types";
import PreviewRenderer from "../PreviewRenderer";
import {
  ErrorHelper,
  ChildrenContainer,
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

const CheckboxPreview: React.FC<Props> = ({
  field,
  block,
  level = 0,
  error,
  renderChildrenInParent = false,
}) => {
  const dispatch = useDispatch();
  const { checkedOptions } = useSelector((state: RootState) => state.form);

  // Sort children based on order property
  const sortFieldsByOrder = (fields: Field[]): Field[] => {
    return [...fields].sort((a, b) => {
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  };

  // Collect all separate block children from ALL checked options
  const allSeparateChildren: Field[] = [];
  (field.options || []).forEach((opt) => {
    if (checkedOptions[opt.id]) {
      const sortedChildren = opt.children ? sortFieldsByOrder(opt.children) : [];
      const separateChildren = sortedChildren.filter(c => c.separateBlock);
      allSeparateChildren.push(...separateChildren);
    }
  });

  return (
    <>
      <OptionsContainer $placement={field.optionsPlacement || "column"}>
        {(field.options || []).map((opt) => {
          const isChecked = !!checkedOptions[opt.id];
          const sortedChildren = opt.children ? sortFieldsByOrder(opt.children) : [];
          
          // Only inline children
          const inlineChildren = sortedChildren.filter(c => !c.separateBlock);

          return (
            <div key={opt.id}>
              <OptionLabel $placement={field.optionsPlacement}>
                <input
                  type="checkbox"
                  name={field.id}
                  value={opt.key}
                  checked={isChecked}
                  onChange={() => {
                    dispatch(setCheckedOption({ optionId: opt.id, value: !isChecked }));
                    dispatch(setClearedField({ fieldId: field.id }));
                  }}
                />
                {opt.label}
              </OptionLabel>

              {/* Render inline children */}
              {!renderChildrenInParent && isChecked && inlineChildren.length > 0 && (
                <ChildrenContainer $placement={opt.placement || "column"}>
                  {inlineChildren.map((child) => (
                    <PreviewRenderer
                      key={child.id}
                      field={child}
                      block={block}
                      level={level + 1}
                      parentSelected={isChecked}
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

export default CheckboxPreview;