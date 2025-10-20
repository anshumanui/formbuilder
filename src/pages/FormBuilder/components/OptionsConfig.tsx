// src/pages/FormBuilder/components/OptionsConfig.tsx
import React, { useState } from "react";
import type { Field, Option, Block } from "../../../types";
import { generateKeyFromLabel, idGenerator } from "../../../utils/helpers";
import FieldEditor from "./FieldEditor";
import {
  InputLabel,
  TextInput,
  SelectInput,
  Button,
  OptionWrapper,
  OptionActions,
  RemoveChildWrapper,
  RemoveButton,
} from "../../../assets/Components.styled";
import styled from "styled-components";

interface Props {
  field: Field;
  onChange: (updated: Field) => void;
  level: number;
  block: Block;
  setBlock: (block: Block) => void;
}

const SharedChildIndicator = styled.span`
  display: inline-block;
  background: #e3f2fd;
  border: 1px solid #2196f3;
  color: #1976d2;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  margin-left: 8px;
`;

const SharedChildBadge = styled.span`
  display: inline-block;
  background: #fff3e0;
  color: #f57c00;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  margin-top: 8px;
  margin-right: 8px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  max-width: 400px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 16px;
`;

const ModalContent = styled.div`
  margin-bottom: 16px;
  max-height: 300px;
  overflow-y: auto;
`;

const CheckboxOption = styled.label`
  display: flex;
  align-items: center;
  padding: 8px 0;
  cursor: pointer;
  
  input {
    margin-right: 8px;
    cursor: pointer;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const OptionsConfig: React.FC<Props> = ({ field, onChange, level, block, setBlock }) => {
  const [shareModal, setShareModal] = useState<{ childId: string; optionId: string } | null>(null);
  const hasOptions = ["select", "radio", "checkbox", "multiselect"].includes(field.type);

  if (!hasOptions) return null;

  // Get all child IDs and their associated options
  const getChildUsageMap = () => {
    const map: Record<string, string[]> = {};
    (field.options || []).forEach((opt) => {
      (opt.children || []).forEach((child) => {
        if (!map[child.id]) {
          map[child.id] = [];
        }
        map[child.id].push(opt.id);
      });
    });
    return map;
  };

  const childUsageMap = getChildUsageMap();

  const isChildShared = (childId: string): boolean => {
    return (childUsageMap[childId] || []).length > 1;
  };

  const getSharedOptionsCount = (childId: string): number => {
    return (childUsageMap[childId] || []).length;
  };

  const updateOption = (optionId: string, updater: (opt: Option) => Option) => {
    const updatedOptions = (field.options || []).map((opt) =>
      opt.id === optionId ? updater(opt) : opt
    );
    onChange({ ...field, options: updatedOptions });
  };

  const addChildField = (optionId: string) => {
    updateOption(optionId, (opt) => ({
      ...opt,
      children: [
        ...(opt.children || []),
        {
          id: idGenerator(),
          type: "text",
          label: "",
          key: "",
          value: "",
        },
      ],
    }));
  };

  const removeChildField = (optionId: string, childIndex: number) => {
    updateOption(optionId, (opt) => {
      const newChildren = [...(opt.children || [])];
      newChildren.splice(childIndex, 1);
      return { ...opt, children: newChildren };
    });
  };

  const updateChildField = (optionId: string, index: number, updated: Field) => {
    updateOption(optionId, (opt) => {
      const newChildren = [...(opt.children || [])];
      newChildren[index] = updated;
      return { ...opt, children: newChildren };
    });
  };

  const shareChildToOptions = (
    sourceOptionId: string,
    childId: string,
    targetOptionIds: string[]
  ) => {
    // Get the source child
    const sourceOption = (field.options || []).find((opt) => opt.id === sourceOptionId);
    const childToShare = sourceOption?.children?.find((c) => c.id === childId);

    if (!childToShare) return;

    // Add this child to selected options
    const updatedOptions = (field.options || []).map((opt) => {
      if (targetOptionIds.includes(opt.id)) {
        const alreadyHas = opt.children?.some((c) => c.id === childId);
        if (!alreadyHas) {
          return {
            ...opt,
            children: [...(opt.children || []), childToShare],
          };
        }
      }
      return opt;
    });

    onChange({ ...field, options: updatedOptions });
    setShareModal(null);
  };

  const removeChildFromOption = (optionId: string, childId: string) => {
    updateOption(optionId, (opt) => ({
      ...opt,
      children: (opt.children || []).filter((c) => c.id !== childId),
    }));
  };

  return (
    <>
      {/* Multi-select specific options */}
      {field.type === "multiselect" && (
        <>
          <InputLabel>Max Selections (optional)</InputLabel>
          <TextInput
            type="number"
            value={field.maxSelections || ""}
            onChange={(e) =>
              onChange({
                ...field,
                maxSelections: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            placeholder="Leave empty for unlimited"
            min="1"
          />
        </>
      )}

      <InputLabel>Options</InputLabel>
      {(field.options || []).map((opt, idx) => (
        <OptionWrapper key={opt.id}>
          <TextInput
            placeholder={`Option ${idx + 1}`}
            value={opt.label}
            onChange={(e) =>
              updateOption(opt.id, (o) => ({
                ...o,
                label: e.target.value,
                key: generateKeyFromLabel(e.target.value),
              }))
            }
          />

          {/* Only show helper text input for top-level elements */}
          {level === 0 && (
            <TextInput
              placeholder="Helper Text"
              value={opt.helperText || ""}
              onChange={(e) =>
                updateOption(opt.id, (o) => ({
                  ...o,
                  helperText: e.target.value,
                }))
              }
            />
          )}

          <RemoveButton
            type="button"
            onClick={() =>
              onChange({
                ...field,
                options: (field.options || []).filter((o) => o.id !== opt.id),
              })
            }
          >
            Remove
          </RemoveButton>

          <OptionActions>
            <Button type="button" onClick={() => addChildField(opt.id)}>
              Add Child Field
            </Button>

            {/* Show placement option if this option has children */}
            {(opt.children || []).length > 0 && (
              <>
                <InputLabel>Children Layout</InputLabel>
                <SelectInput
                  value={opt.placement || "column"}
                  onChange={(e) =>
                    updateOption(opt.id, (o) => ({
                      ...o,
                      placement: e.target.value as "row" | "column",
                    }))
                  }
                >
                  <option value="column">Column</option>
                  <option value="row">Row</option>
                </SelectInput>
              </>
            )}
          </OptionActions>

          {/* Render children with share functionality */}
          {(opt.children || []).map((child, childIdx) => {
            const sharedCount = getSharedOptionsCount(child.id);
            const shared = isChildShared(child.id);

            return (
              <RemoveChildWrapper key={child.id}>
                {shared && (
                  <SharedChildBadge>
                    🔗 Shared with {sharedCount} option(s)
                  </SharedChildBadge>
                )}

                <FieldEditor
                  field={child}
                  onChange={(updated) => updateChildField(opt.id, childIdx, updated)}
                  level={level + 1}
                  block={block}
                />

                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <RemoveButton
                    type="button"
                    onClick={() =>
                      shared
                        ? removeChildFromOption(opt.id, child.id)
                        : removeChildField(opt.id, childIdx)
                    }
                  >
                    {shared ? "Remove from this option" : "Remove Child"}
                  </RemoveButton>

                  {!shared && (
                    <Button
                      type="button"
                      onClick={() => setShareModal({ childId: child.id, optionId: opt.id })}
                      style={{ background: "#e3f2fd", borderColor: "#2196f3", color: "#1976d2" }}
                    >
                      Share to Other Options
                    </Button>
                  )}
                </div>
              </RemoveChildWrapper>
            );
          })}
        </OptionWrapper>
      ))}

      <Button
        type="button"
        onClick={() =>
          onChange({
            ...field,
            options: [
              ...(field.options || []),
              {
                id: idGenerator(),
                label: "",
                key: "",
                helperText: "",
                children: [],
              },
            ],
          })
        }
      >
        Add Option
      </Button>

      {/* Share Modal */}
      {shareModal && (
        <ModalOverlay onClick={() => setShareModal(null)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Share Child to Other Options</ModalTitle>
            <ModalContent>
              {(field.options || [])
                .filter((opt) => opt.id !== shareModal.optionId)
                .map((opt) => {
                  const alreadyShared = opt.children?.some((c) => c.id === shareModal.childId);
                  return (
                    <CheckboxOption key={opt.id}>
                      <input
                        type="checkbox"
                        defaultChecked={alreadyShared}
                        disabled={alreadyShared}
                      />
                      <span>{opt.label || `Option (${opt.id.slice(0, 4)})`}</span>
                    </CheckboxOption>
                  );
                })}
            </ModalContent>
            <ModalActions>
              <Button
                type="button"
                onClick={() => {
                  const checkedOptions = Array.from(
                    document.querySelectorAll(`input[type="checkbox"]:checked`)
                  )
                    .map((el) => (el as HTMLInputElement).value)
                    .filter((_, i) => i < (field.options || []).length - 1);

                  const selectedOptionIds = (field.options || [])
                    .filter((opt) => opt.id !== shareModal.optionId)
                    .filter((_, i) => {
                      const checkboxes = Array.from(
                        document.querySelectorAll(`input[type="checkbox"]:not(:disabled)`)
                      );
                      return checkboxes[i] && (checkboxes[i] as HTMLInputElement).checked;
                    })
                    .map((opt) => opt.id);

                  shareChildToOptions(shareModal.optionId, shareModal.childId, selectedOptionIds);
                }}
              >
                Share
              </Button>
              <Button type="button" onClick={() => setShareModal(null)}>
                Cancel
              </Button>
            </ModalActions>
          </Modal>
        </ModalOverlay>
      )}
    </>
  );
};

export default OptionsConfig;