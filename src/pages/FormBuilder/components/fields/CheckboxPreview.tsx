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
  BlockWrapper
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

  return (
    <>
      <OptionsContainer $placement={field.optionsPlacement || "column"}>
        {(field.options || []).map((opt) => {
          const isChecked = !!checkedOptions[opt.id];
          const sortedChildren = opt.children ? sortFieldsByOrder(opt.children) : [];

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

              {/* Only render children inline if renderChildrenInParent is FALSE */}
              {!renderChildrenInParent && isChecked && sortedChildren.length > 0 && (
                <ChildrenContainer $placement={opt.placement || "column"}>
                  {sortedChildren.map((child) => (
                    <BlockWrapper key={child.id} $level={level + 1}>
                      <PreviewRenderer
                        field={child}
                        block={block}
                        level={level + 1}
                        parentSelected={isChecked}
                      />
                    </BlockWrapper>
                  ))}
                </ChildrenContainer>
              )}
            </div>
          );
        })}
      </OptionsContainer>
      {error && <ErrorHelper>{error}</ErrorHelper>}
    </>
  );
};

export default CheckboxPreview;