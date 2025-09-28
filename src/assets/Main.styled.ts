import styled, { css } from 'styled-components';

// Layout Components
export const Container = styled.div`
  display: flex; 
  height: 100vh;
`;

export const BuilderPanel = styled.div`
  flex: 1; 
  padding: 20px; 
  border-right: 1px solid #ddd; 
  overflow-y: auto;
`;

export const PreviewPanel = styled.div`
  flex: 1; 
  padding: 20px; 
  overflow-y: auto; 
  background: #fafafa;
`;

// Form Components
export const SectionTitle = styled.h2`
  margin-bottom: 20px;
`;

export const InputLabel = styled.label`
  display: block; 
  margin-top: 12px; 
  font-weight: 600;
`;

export const TextInput = styled.input`
  width: 100%; 
  padding: 6px; 
  border: 1px solid #ccc; 
  border-radius: 4px;
`;

export const SelectInput = styled.select`
  width: 100%; 
  padding: 6px; 
  border: 1px solid #ccc; 
  border-radius: 4px;
`;

export const CheckboxInput = styled.input`
  margin-right: 6px;
`;

export const Button = styled.button`
  margin-top: 10px;
  padding: 6px 12px;
  background: #eee;
  border: 1px solid #ccc;
  cursor: pointer;
  margin-right: 8px;
`;

export const RemoveButton = styled(Button)`
  margin-top: 4px;
  background: #fdd;
  border-color: #d00;
  color: #900;
`;

// Field Editor Components
export const FieldContainer = styled.div<{ level: number }>`
  margin-left: ${(p) => (p.level === 0 ? 0 : 20 * p.level)}px;
  padding: 12px 0;
  border-left: ${(p) => (p.level === 0 ? '2px solid #ccc' : 'none')};
  padding-left: ${(p) => (p.level === 0 ? '10px' : '0')};
`;

export const OptionWrapper = styled.div`
  margin-bottom: 10px;
`;

export const OptionActions = styled.div`
  margin-top: 6px;
  display: flex;
  gap: 8px;
`;

export const RemoveChildWrapper = styled.div`
  margin-top: 4px;
`;

// Preview Components
export const BlockWrapper = styled.div<{ 
  level?: number; 
  separate?: boolean; 
  blockElement?: boolean;
}>`
  background: #fff;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 6px;
  
  box-shadow: ${(p) => 
    (p.level === 0 || (p.level === 1 && p.separate)) 
      ? '0 2px 5px rgba(0,0,0,0.1)' 
      : 'none'
  };

  ${(p) => p.blockElement && css`
    flex: 1 1 100%;
    width: 100%;
  `}

  ${(p) => !p.blockElement && css`
    flex: 0 1 auto;
  `}
`;

export const PreviewLabel = styled.label<{ mandatory?: boolean }>`
  font-weight: bold;
  display: block;
  margin-bottom: 4px;
  color: ${(p) => (p.mandatory ? "red" : "#000")};
`;

export const HelperText = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
`;

export const ErrorHelper = styled(HelperText)`
  color: #c62828;
  margin-top: 6px;
`;

export const ChildrenContainer = styled.div<{ placement: "row" | "column" }>`
  display: flex;
  flex-direction: ${(props) => (props.placement === "row" ? "row" : "column")};
  flex-wrap: ${(props) => (props.placement === "row" ? "wrap" : "nowrap")};
  gap: 16px;
  margin-top: 8px;
`;

// Utility Components
export const FlexRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const RelativeTextareaWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const CharCounter = styled.div`
  position: absolute;
  bottom: 4px;
  right: 8px;
  font-size: 12px;
  color: #666;
`;

export const SmallIcon = styled.span`
  font-size: 18px;
`;