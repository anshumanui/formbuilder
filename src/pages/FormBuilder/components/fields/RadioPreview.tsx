import React from "react";
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../../../../store";
import { setSelectedOption, setClearedField } from "../../../../store/slices/formSlice";
import type { Field, Block } from "../../../../types";
import PreviewRenderer from "../PreviewRenderer";
import { 
  HelperText, 
  ChildrenContainer, 
  ErrorHelper, 
  BlockWrapper,
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
      <OptionsContainer $placement={field.optionsPlacement || "column"}>
        {(field.options || []).map((opt) => {
          const isSelected = selectedOptions[field.id] === opt.id;
          const sortedChildren = opt.children ? sortFieldsByOrder(opt.children) : [];
          
          // Separate children into inline and separate block
          const inlineChildren = sortedChildren.filter(c => !c.separateBlock);
          const separateChildren = sortedChildren.filter(c => c.separateBlock);

          return (
            <React.Fragment key={opt.id}>
              <div>
                <OptionLabel $placement={field.optionsPlacement}>
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
                </OptionLabel>

                {opt.helperText && level === 0 && <HelperText>{opt.helperText}</HelperText>}

                {/* Render inline children */}
                {!renderChildrenInParent && isSelected && inlineChildren.length > 0 && (
                  <ChildrenContainer $placement={opt.placement || "column"}>
                    {inlineChildren.map((child) => (
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
              </div>
              
              {/* Render separate block children OUTSIDE */}
              {!renderChildrenInParent && isSelected && separateChildren.map((child) => (
                <SeparateBlockWrapper key={child.id}>
                  <PreviewRenderer
                    field={child}
                    block={block}
                    level={level + 1}
                    parentSelected={true}
                  />
                </SeparateBlockWrapper>
              ))}
            </React.Fragment>
          );
        })}
      </OptionsContainer>
      {error && <ErrorHelper>{error}</ErrorHelper>}
    </>
  );
};

export default RadioPreview;