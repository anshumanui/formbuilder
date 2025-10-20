// src/pages/FormBuilder/components/fields/SelectPreview.tsx (Updated)
import React from "react";
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../../../../store";
import { setFieldValue, setClearedField } from "../../../../store/slices/formSlice";
import type { Field, Block } from "../../../../types";
import PreviewRenderer from "../PreviewRenderer";
import { ChildrenContainer, ErrorHelper, FieldWrapper, SeparateBlockWrapper } from "../../../../assets/Components.styled";
import styled from "styled-components";

const SharedChildIndicator = styled.div`
  background: #e3f2fd;
  border-left: 3px solid #2196f3;
  padding: 8px 12px;
  margin: 8px 0;
  font-size: 12px;
  color: #1565c0;
  border-radius: 2px;
`;

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

  // Detect shared children (same child ID across multiple options)
  const getSharedChildIds = (): Set<string> => {
    const childIdMap: Record<string, number> = {};
    (field.options || []).forEach((opt) => {
      (opt.children || []).forEach((child) => {
        childIdMap[child.id] = (childIdMap[child.id] || 0) + 1;
      });
    });

    return new Set(
      Object.entries(childIdMap)
        .filter(([, count]) => count > 1)
        .map(([id]) => id)
    );
  };

  const sharedChildIds = getSharedChildIds();

  const sortedChildren = selectedOpt?.children ? sortFieldsByOrder(selectedOpt.children) : [];
  
  // Separate children into inline and separate block
  const inlineChildren = sortedChildren.filter(c => !c.separateBlock);
  const separateChildren = sortedChildren.filter(c => c.separateBlock);

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

      {/* Render inline children first */}
      {!renderChildrenInParent && value && inlineChildren.length > 0 && (
        <ChildrenContainer $placement={selectedOpt?.placement || "column"}>
          {inlineChildren.map((child) => (
            <FieldWrapper key={child.id} $blockElement={child.blockElement}>
              {sharedChildIds.has(child.id) && (
                <SharedChildIndicator>
                  🔗 This field is shared with other options. Changes will apply to all.
                </SharedChildIndicator>
              )}
              <PreviewRenderer
                field={child}
                block={block}
                level={level + 1}
                parentSelected={!!value}
              />
            </FieldWrapper>
          ))}
        </ChildrenContainer>
      )}

      {/* Render separate block children AFTER inline children */}
      {!renderChildrenInParent && value && separateChildren.map((child) => (
        <SeparateBlockWrapper key={child.id}>
          {sharedChildIds.has(child.id) && (
            <SharedChildIndicator>
              🔗 This field is shared with other options. Changes will apply to all.
            </SharedChildIndicator>
          )}
          <PreviewRenderer
            field={child}
            block={block}
            level={level + 1}
            parentSelected={!!value}
          />
        </SeparateBlockWrapper>
      ))}
    </>
  );
};

export default SelectPreview;