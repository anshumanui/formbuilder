import React from "react";
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../../../../store";
import { setFieldValue, setClearedField } from "../../../../store/slices/formSlice";
import type { Field, Block } from "../../../../types";
import PreviewRenderer from "../PreviewRenderer";
import { ChildrenContainer, ErrorHelper, BlockWrapper } from "../../../../assets/Components.styled";

interface Props {
  field: Field;
  block: Block;
  level?: number;
  error?: string | null;
  renderChildrenInParent?: boolean;
}

const SelectPreview: React.FC<Props> = ({
  field,
  block,
  level = 0,
  error,
  renderChildrenInParent = false,
}) => {
  const dispatch = useDispatch();
  const { fieldValues } = useSelector((state: RootState) => state.form);
  const value = fieldValues[field.id] || "";
  const selectedOpt = (field.options || []).find((opt) => opt.key === value);

  // Sort children based on order property
  const sortFieldsByOrder = (fields: Field[]): Field[] => {
    return [...fields].sort((a, b) => {
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  };

  const sortedChildren = selectedOpt?.children ? sortFieldsByOrder(selectedOpt.children) : [];

  return (
    <>
      <select
        value={value}
        onChange={(e) => {
          dispatch(setFieldValue({ fieldId: field.id, value: e.target.value }));
          dispatch(setClearedField({ fieldId: field.id }));
        }}
      >
        <option value="">-- Select --</option>
        {(field.options || []).map((opt) => (
          <option key={opt.id} value={opt.key}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && <ErrorHelper>{error}</ErrorHelper>}

      {/* Only render children inline if NOT renderChildrenInParent */}
      {!renderChildrenInParent &&
        value && sortedChildren.length > 0 && (
        <ChildrenContainer $placement={selectedOpt?.placement || "column"}>
          {sortedChildren.map((child) => (
            <BlockWrapper key={child.id} $level={level + 1}>
              <PreviewRenderer
                field={child}
                block={block}
                level={level + 1}
                parentSelected={!!value}
              />
            </BlockWrapper>
          ))}
        </ChildrenContainer>
      )}
    </>
  );
};

export default SelectPreview;