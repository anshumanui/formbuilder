import {
  idGenerator,
  generateKeyFromLabel,
  cleanBlockForExport,
  getErrorForField,
  generateUserResponseJSON,
  mapUserResponseToFormState,
} from '../helpers';
import type { Block, Field } from '../../types';
import { FORM_CONFIG } from '../config';

// Mock the config
jest.mock('../config', () => ({
  FORM_CONFIG: {
    showValidationErrors: true,
    enableRealTimeValidation: false,
    strictValidation: true,
  },
}));

describe('Helpers', () => {
  describe('idGenerator', () => {
    it('should generate a unique ID', () => {
      const id1 = idGenerator();
      const id2 = idGenerator();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it('should generate ID of expected length', () => {
      const id = idGenerator();
      
      expect(id.length).toBe(8);
    });

    it('should generate alphanumeric ID', () => {
      const id = idGenerator();
      
      expect(id).toMatch(/^[a-z0-9]+$/);
    });

    it('should generate different IDs on multiple calls', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(idGenerator());
      }
      
      expect(ids.size).toBe(100);
    });
  });

  describe('generateKeyFromLabel', () => {
    it('should convert label to snake_case key', () => {
      const key = generateKeyFromLabel('My Field Label');
      
      expect(key).toBe('my_field_label');
    });

    it('should handle single word', () => {
      const key = generateKeyFromLabel('Label');
      
      expect(key).toBe('label');
    });

    it('should remove special characters', () => {
      const key = generateKeyFromLabel('My Field! @#$% Label?');
      
      expect(key).toBe('my_field_label');
    });

    it('should handle multiple spaces', () => {
      const key = generateKeyFromLabel('My    Field    Label');
      
      expect(key).toBe('my_field_label');
    });

    it('should trim whitespace', () => {
      const key = generateKeyFromLabel('  My Field Label  ');
      
      expect(key).toBe('my_field_label');
    });

    it('should handle empty string', () => {
      const key = generateKeyFromLabel('');
      
      expect(key).toBe('');
    });

    it('should handle numbers', () => {
      const key = generateKeyFromLabel('Field 123 Label');
      
      expect(key).toBe('field_123_label');
    });

    it('should convert to lowercase', () => {
      const key = generateKeyFromLabel('UPPERCASE LABEL');
      
      expect(key).toBe('uppercase_label');
    });
  });

  describe('cleanBlockForExport', () => {
    it('should export block with basic field', () => {
      const block: Block = {
        id: 'block1',
        separateBlock: false,
        displayOrdering: false,
        field: {
          id: 'field1',
          type: 'text',
          label: 'Test Field',
          key: 'test_field',
          value: '',
        },
      };

      const cleaned = cleanBlockForExport(block);

      expect(cleaned.id).toBe('block1');
      expect(cleaned.separateBlock).toBe(false);
      expect(cleaned.displayOrdering).toBe(false);
      expect(cleaned.field.id).toBe('field1');
      expect(cleaned.field.type).toBe('text');
      expect(cleaned.field.label).toBe('Test Field');
      expect(cleaned.field.key).toBe('test_field');
    });

    it('should include blockLabel when present', () => {
      const block: Block = {
        id: 'block1',
        separateBlock: true,
        displayOrdering: false,
        blockLabel: 'My Block',
        field: {
          id: 'field1',
          type: 'text',
          label: 'Test',
          key: 'test',
          value: '',
        },
      };

      const cleaned = cleanBlockForExport(block);

      expect(cleaned.blockLabel).toBe('My Block');
    });

    it('should not include blockLabel when absent', () => {
      const block: Block = {
        id: 'block1',
        separateBlock: false,
        displayOrdering: false,
        field: {
          id: 'field1',
          type: 'text',
          label: 'Test',
          key: 'test',
          value: '',
        },
      };

      const cleaned = cleanBlockForExport(block);

      expect(cleaned).not.toHaveProperty('blockLabel');
    });

    it('should include optional field properties when present', () => {
      const block: Block = {
        id: 'block1',
        separateBlock: false,
        displayOrdering: false,
        field: {
          id: 'field1',
          type: 'text',
          label: 'Test',
          key: 'test',
          value: '',
          placeholder: 'Enter text',
          mandatory: true,
          errorMessage: 'Required',
          order: 1,
          blockElement: true,
        },
      };

      const cleaned = cleanBlockForExport(block);

      expect(cleaned.field.placeholder).toBe('Enter text');
      expect(cleaned.field.mandatory).toBe(true);
      expect(cleaned.field.errorMessage).toBe('Required');
      expect(cleaned.field.order).toBe(1);
      expect(cleaned.field.blockElement).toBe(true);
    });

    it('should clean field with options', () => {
      const block: Block = {
        id: 'block1',
        separateBlock: false,
        displayOrdering: false,
        field: {
          id: 'field1',
          type: 'radio',
          label: 'Test',
          key: 'test',
          value: '',
          options: [
            {
              id: 'opt1',
              label: 'Option 1',
              key: 'option_1',
              helperText: 'Helper',
              children: [],
            },
          ],
        },
      };

      const cleaned = cleanBlockForExport(block);

      expect(cleaned.field.options).toHaveLength(1);
      expect(cleaned.field.options[0].label).toBe('Option 1');
      expect(cleaned.field.options[0].helperText).toBe('Helper');
    });

    it('should remove options with empty labels', () => {
      const block: Block = {
        id: 'block1',
        separateBlock: false,
        displayOrdering: false,
        field: {
          id: 'field1',
          type: 'radio',
          label: 'Test',
          key: 'test',
          value: '',
          options: [
            { id: 'opt1', label: 'Valid', key: 'valid', children: [] },
            { id: 'opt2', label: '', key: '', children: [] },
          ],
        },
      };

      const cleaned = cleanBlockForExport(block);

      expect(cleaned.field.options).toHaveLength(1);
      expect(cleaned.field.options[0].label).toBe('Valid');
    });

    it('should clean nested children fields', () => {
      const block: Block = {
        id: 'block1',
        separateBlock: false,
        displayOrdering: false,
        field: {
          id: 'field1',
          type: 'radio',
          label: 'Test',
          key: 'test',
          value: '',
          options: [
            {
              id: 'opt1',
              label: 'Option 1',
              key: 'option_1',
              children: [
                {
                  id: 'child1',
                  type: 'text',
                  label: 'Child Field',
                  key: 'child_field',
                  value: '',
                },
              ],
            },
          ],
        },
      };

      const cleaned = cleanBlockForExport(block);

      expect(cleaned.field.options[0].children).toHaveLength(1);
      expect(cleaned.field.options[0].children[0].label).toBe('Child Field');
    });
  });

  describe('getErrorForField', () => {
    const baseField: Field = {
      id: 'field1',
      type: 'text',
      label: 'Test',
      key: 'test',
      value: '',
      mandatory: true,
    };

    beforeEach(() => {
      // Reset config mock
      (FORM_CONFIG as any).showValidationErrors = true;
    });

    it('should return null when showValidationErrors is false', () => {
      (FORM_CONFIG as any).showValidationErrors = false;

      const error = getErrorForField(
        baseField,
        true,
        true,
        {},
        {},
        {},
        {}
      );

      expect(error).toBeNull();
    });

    it('should return null when parent is not selected', () => {
      const error = getErrorForField(
        baseField,
        false,
        true,
        {},
        {},
        {},
        {}
      );

      expect(error).toBeNull();
    });

    it('should return null when form is not submitted', () => {
      const error = getErrorForField(
        baseField,
        true,
        false,
        {},
        {},
        {},
        {}
      );

      expect(error).toBeNull();
    });

    it('should return null when field is not mandatory', () => {
      const nonMandatoryField = { ...baseField, mandatory: false };

      const error = getErrorForField(
        nonMandatoryField,
        true,
        true,
        {},
        {},
        {},
        {}
      );

      expect(error).toBeNull();
    });

    it('should return null when field is cleared', () => {
      const error = getErrorForField(
        baseField,
        true,
        true,
        {},
        { field1: true },
        {},
        {}
      );

      expect(error).toBeNull();
    });

    it('should return error for empty text field', () => {
      const error = getErrorForField(
        baseField,
        true,
        true,
        {},
        {},
        {},
        {}
      );

      expect(error).toBe('This field is required');
    });

    it('should return custom error message', () => {
      const fieldWithCustomError = {
        ...baseField,
        errorMessage: 'Custom error',
      };

      const error = getErrorForField(
        fieldWithCustomError,
        true,
        true,
        {},
        {},
        {},
        {}
      );

      expect(error).toBe('Custom error');
    });

    it('should validate radio field', () => {
      const radioField: Field = {
        ...baseField,
        type: 'radio',
      };

      const error = getErrorForField(
        radioField,
        true,
        true,
        {},
        {},
        {},
        {}
      );

      expect(error).toBe('This field is required');
    });

    it('should return null for radio field with selection', () => {
      const radioField: Field = {
        ...baseField,
        type: 'radio',
      };

      const error = getErrorForField(
        radioField,
        true,
        true,
        {},
        {},
        { field1: 'opt1' },
        {}
      );

      expect(error).toBeNull();
    });

    it('should validate checkbox field', () => {
      const checkboxField: Field = {
        ...baseField,
        type: 'checkbox',
        options: [
          { id: 'opt1', label: 'Option 1', key: 'option_1', children: [] },
        ],
      };

      const error = getErrorForField(
        checkboxField,
        true,
        true,
        {},
        {},
        {},
        {}
      );

      expect(error).toBe('Please select at least one option');
    });

    it('should return null for checkbox with at least one checked', () => {
      const checkboxField: Field = {
        ...baseField,
        type: 'checkbox',
        options: [
          { id: 'opt1', label: 'Option 1', key: 'option_1', children: [] },
        ],
      };

      const error = getErrorForField(
        checkboxField,
        true,
        true,
        {},
        {},
        {},
        { opt1: true }
      );

      expect(error).toBeNull();
    });

    it('should validate select field', () => {
      const selectField: Field = {
        ...baseField,
        type: 'select',
      };

      const error = getErrorForField(
        selectField,
        true,
        true,
        {},
        {},
        {},
        {}
      );

      expect(error).toBe('Please select an option');
    });

    it('should return null for select field with value', () => {
      const selectField: Field = {
        ...baseField,
        type: 'select',
      };

      const error = getErrorForField(
        selectField,
        true,
        true,
        { field1: 'option1' },
        {},
        {},
        {}
      );

      expect(error).toBeNull();
    });

    it('should validate multiselect field', () => {
      const multiselectField: Field = {
        ...baseField,
        type: 'multiselect',
      };

      const error = getErrorForField(
        multiselectField,
        true,
        true,
        {},
        {},
        {},
        {},
        {}
      );

      expect(error).toBe('Please select at least one option');
    });

    it('should return null for multiselect with selections', () => {
      const multiselectField: Field = {
        ...baseField,
        type: 'multiselect',
      };

      const error = getErrorForField(
        multiselectField,
        true,
        true,
        {},
        {},
        {},
        {},
        { field1: ['opt1'] }
      );

      expect(error).toBeNull();
    });
  });

  describe('generateUserResponseJSON', () => {
    it('should generate response for text field', () => {
      const block: Block = {
        id: 'block1',
        field: {
          id: 'field1',
          type: 'text',
          label: 'Name',
          key: 'name',
          value: '',
        },
      };

      const response = generateUserResponseJSON(
        block,
        {},
        {},
        { field1: 'John Doe' },
        {}
      );

      expect(response).toEqual({
        name: {
          name: 'John Doe',
        },
      });
    });

    it('should generate response with empty string for empty text field', () => {
      const block: Block = {
        id: 'block1',
        field: {
          id: 'field1',
          type: 'text',
          label: 'Name',
          key: 'name',
          value: '',
        },
      };

      const response = generateUserResponseJSON(
        block,
        {},
        {},
        {},
        {}
      );

      expect(response).toEqual({
        name: {
          name: '',
        },
      });
    });

    it('should generate response for radio field with all options', () => {
      const block: Block = {
        id: 'block1',
        field: {
          id: 'field1',
          type: 'radio',
          label: 'Choice',
          key: 'choice',
          value: '',
          options: [
            { id: 'opt1', label: 'Yes', key: 'yes', children: [] },
            { id: 'opt2', label: 'No', key: 'no', children: [] },
          ],
        },
      };

      const response = generateUserResponseJSON(
        block,
        { field1: 'opt1' },
        {},
        {},
        {}
      );

      expect(response).toEqual({
        choice: {
          yes: { selected: true },
          no: { selected: false },
        },
      });
    });

    it('should generate response for checkbox field', () => {
      const block: Block = {
        id: 'block1',
        field: {
          id: 'field1',
          type: 'checkbox',
          label: 'Options',
          key: 'options',
          value: '',
          options: [
            { id: 'opt1', label: 'Option 1', key: 'option_1', children: [] },
            { id: 'opt2', label: 'Option 2', key: 'option_2', children: [] },
          ],
        },
      };

      const response = generateUserResponseJSON(
        block,
        {},
        { opt1: true, opt2: false },
        {},
        {}
      );

      expect(response).toEqual({
        options: {
          options: {
            option_1: { selected: true },
            option_2: { selected: false },
          },
        },
      });
    });

    it('should generate response for select field', () => {
      const block: Block = {
        id: 'block1',
        field: {
          id: 'field1',
          type: 'select',
          label: 'Select',
          key: 'select',
          value: '',
          options: [
            { id: 'opt1', label: 'Option 1', key: 'option_1', children: [] },
            { id: 'opt2', label: 'Option 2', key: 'option_2', children: [] },
          ],
        },
      };

      const response = generateUserResponseJSON(
        block,
        {},
        {},
        { field1: 'option_1' },
        {}
      );

      expect(response).toEqual({
        select: {
          option_1: { selected: true },
          option_2: { selected: false },
        },
      });
    });

    it('should generate response for multiselect field', () => {
      const block: Block = {
        id: 'block1',
        field: {
          id: 'field1',
          type: 'multiselect',
          label: 'Multi',
          key: 'multi',
          value: '',
          options: [
            { id: 'opt1', label: 'Option 1', key: 'option_1', children: [] },
            { id: 'opt2', label: 'Option 2', key: 'option_2', children: [] },
          ],
        },
      };

      const response = generateUserResponseJSON(
        block,
        {},
        {},
        {},
        { field1: ['option_1'] }
      );

      expect(response).toEqual({
        multi: {
          multi: {
            option_1: { selected: true },
            option_2: { selected: false },
          },
        },
      });
    });

    it('should include children in radio response', () => {
      const block: Block = {
        id: 'block1',
        field: {
          id: 'field1',
          type: 'radio',
          label: 'Choice',
          key: 'choice',
          value: '',
          options: [
            {
              id: 'opt1',
              label: 'Yes',
              key: 'yes',
              children: [
                {
                  id: 'child1',
                  type: 'text',
                  label: 'Name',
                  key: 'name',
                  value: '',
                },
              ],
            },
          ],
        },
      };

      const response = generateUserResponseJSON(
        block,
        { field1: 'opt1' },
        {},
        { child1: 'John' },
        {}
      );

      expect(response.choice.yes.selected).toBe(true);
      expect(response.choice.yes.name).toBe('John');
    });
  });

  describe('mapUserResponseToFormState', () => {
    it('should map text field response to form state', () => {
      const block: Block = {
        id: 'block1',
        field: {
          id: 'field1',
          type: 'text',
          label: 'Name',
          key: 'name',
          value: '',
        },
      };

      const userResponse = {
        name: {
          name: 'John Doe',
        },
      };

      const state = mapUserResponseToFormState(block, userResponse);

      expect(state.fieldValues.field1).toBe('John Doe');
    });

    it('should map radio field response to form state', () => {
      const block: Block = {
        id: 'block1',
        field: {
          id: 'field1',
          type: 'radio',
          label: 'Choice',
          key: 'choice',
          value: '',
          options: [
            { id: 'opt1', label: 'Yes', key: 'yes', children: [] },
            { id: 'opt2', label: 'No', key: 'no', children: [] },
          ],
        },
      };

      const userResponse = {
        choice: {
          yes: { selected: true },
          no: { selected: false },
        },
      };

      const state = mapUserResponseToFormState(block, userResponse);

      expect(state.selectedOptions.field1).toBe('opt1');
    });

    it('should map checkbox field response to form state', () => {
      const block: Block = {
        id: 'block1',
        field: {
          id: 'field1',
          type: 'checkbox',
          label: 'Options',
          key: 'options',
          value: '',
          options: [
            { id: 'opt1', label: 'Option 1', key: 'option_1', children: [] },
            { id: 'opt2', label: 'Option 2', key: 'option_2', children: [] },
          ],
        },
      };

      const userResponse = {
        options: {
          options: {
            option_1: { selected: true },
            option_2: { selected: false },
          },
        },
      };

      const state = mapUserResponseToFormState(block, userResponse);

      expect(state.checkedOptions.opt1).toBe(true);
      expect(state.checkedOptions.opt2).toBeUndefined();
    });

    it('should map multiselect field response to form state', () => {
      const block: Block = {
        id: 'block1',
        field: {
          id: 'field1',
          type: 'multiselect',
          label: 'Multi',
          key: 'multi',
          value: '',
          options: [
            { id: 'opt1', label: 'Option 1', key: 'option_1', children: [] },
            { id: 'opt2', label: 'Option 2', key: 'option_2', children: [] },
          ],
        },
      };

      const userResponse = {
        multi: {
          multi: {
            option_1: { selected: true },
            option_2: { selected: true },
          },
        },
      };

      const state = mapUserResponseToFormState(block, userResponse);

      expect(state.multiSelectValues.field1).toEqual(['option_1', 'option_2']);
    });

    it('should handle nested children in response', () => {
      const block: Block = {
        id: 'block1',
        field: {
          id: 'field1',
          type: 'radio',
          label: 'Choice',
          key: 'choice',
          value: '',
          options: [
            {
              id: 'opt1',
              label: 'Yes',
              key: 'yes',
              children: [
                {
                  id: 'child1',
                  type: 'text',
                  label: 'Name',
                  key: 'name',
                  value: '',
                },
              ],
            },
          ],
        },
      };

      const userResponse = {
        choice: {
          yes: {
            selected: true,
            name: 'John Doe',
          },
        },
      };

      const state = mapUserResponseToFormState(block, userResponse);

      expect(state.selectedOptions.field1).toBe('opt1');
      expect(state.fieldValues.child1).toBe('John Doe');
    });

    it('should return empty state for invalid response', () => {
      const block: Block = {
        id: 'block1',
        field: {
          id: 'field1',
          type: 'text',
          label: 'Name',
          key: 'name',
          value: '',
        },
      };

      const state = mapUserResponseToFormState(block, {});

      expect(state.fieldValues).toEqual({});
      expect(state.selectedOptions).toEqual({});
      expect(state.checkedOptions).toEqual({});
      expect(state.multiSelectValues).toEqual({});
    });
  });
});