import React from "react";
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../../../../store";
import { setSelectedOption, setClearedField } from "../../../../store/slices/formSlice";
import type { Field, Block } from "../../../../types";
import PreviewRenderer from "../PreviewRenderer";
import { OptionWrapper, HelperText, ChildrenContainer, ErrorHelper, BlockWrapper } from "../../../../assets/Components.styled";

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

  return (
    <>
      {(field.options || []).map((opt) => {
        const isSelected = selectedOptions[field.id] === opt.id;
        const sortedChildren = opt.children ? sortFieldsByOrder(opt.children) : [];

        return (
          <OptionWrapper key={opt.id}>
            <label>
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
            </label>

            {opt.helperText && level === 0 && <HelperText>{opt.helperText}</HelperText>}

            {/* Only render children inline if NOT renderChildrenInParent */}
            {!renderChildrenInParent &&
              selectedOptions[field.id] === opt.id &&
              sortedChildren.length > 0 && (
                <ChildrenContainer $placement={opt.placement || "column"}>
                  {sortedChildren.map((child) => (
                    <BlockWrapper key={child.id} $level={level + 1}>
                      <PreviewRenderer
                        field={child}
                        block={block}
                        level={level + 1}
                        parentSelected={true}
                      />
                    </BlockWrapper>
                  ))}
                </ChildrenContainer>
              )}
          </OptionWrapper>
        );
      })}
      {error && <ErrorHelper>{error}</ErrorHelper>}
    </>
  );
};

export default RadioPreview;