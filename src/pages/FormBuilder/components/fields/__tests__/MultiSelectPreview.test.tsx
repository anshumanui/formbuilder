import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import MultiSelectPreview from '../MultiSelectPreview';
import formReducer from '../../../../../store/slices/formSlice';
import type { Field, Block } from '../../../../../types';

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      form: formReducer,
    },
    preloadedState: initialState,
  });
};

const mockField: Field = {
  id: 'field1',
  type: 'multiselect',
  label: 'Test MultiSelect',
  key: 'test_multiselect',
  value: '',
  options: [
    { id: 'opt1', label: 'Option 1', key: 'option_1', children: [] },
    { id: 'opt2', label: 'Option 2', key: 'option_2', children: [] },
    { id: 'opt3', label: 'Option 3', key: 'option_3', children: [] },
  ],
};

const mockBlock: Block = {
  id: 'block1',
  field: mockField,
  separateBlock: false,
};

describe('MultiSelectPreview', () => {
  it('renders all multiselect options', () => {
    const store = createMockStore({
      form: {
        fieldValues: {},
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <MultiSelectPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('selects multiple options', () => {
    const store = createMockStore({
      form: {
        fieldValues: {},
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <MultiSelectPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    const checkbox1 = screen.getAllByRole('checkbox')[0];
    const checkbox2 = screen.getAllByRole('checkbox')[1];

    fireEvent.click(checkbox1);
    fireEvent.click(checkbox2);

    const state = store.getState();
    expect(state.form.multiSelectValues.field1).toEqual(['option_1', 'option_2']);
  });

  it('shows selected values from Redux store', () => {
    const store = createMockStore({
      form: {
        fieldValues: {},
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: { field1: ['option_1', 'option_3'] },
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <MultiSelectPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    expect(checkboxes[0].checked).toBe(true);  // Option 1
    expect(checkboxes[1].checked).toBe(false); // Option 2
    expect(checkboxes[2].checked).toBe(true);  // Option 3
  });

  it('deselects option when clicked again', () => {
    const store = createMockStore({
      form: {
        fieldValues: {},
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: { field1: ['option_1'] },
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <MultiSelectPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    const state = store.getState();
    expect(state.form.multiSelectValues.field1).toEqual([]);
  });

  it('enforces maxSelections limit', () => {
    const fieldWithMaxSelections: Field = {
      ...mockField,
      maxSelections: 2,
    };

    const store = createMockStore({
      form: {
        fieldValues: {},
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <MultiSelectPreview field={fieldWithMaxSelections} block={mockBlock} />
      </Provider>
    );

    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];

    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    fireEvent.click(checkboxes[2]); // Should be blocked

    const state = store.getState();
    expect(state.form.multiSelectValues.field1).toHaveLength(2);
    expect(state.form.multiSelectValues.field1).toEqual(['option_1', 'option_2']);
  });

  it('displays selection counter when maxSelections is set', () => {
    const fieldWithMaxSelections: Field = {
      ...mockField,
      maxSelections: 3,
    };

    const store = createMockStore({
      form: {
        fieldValues: {},
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: { field1: ['option_1'] },
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <MultiSelectPreview field={fieldWithMaxSelections} block={mockBlock} />
      </Provider>
    );

    expect(screen.getByText('1 / 3 selected')).toBeInTheDocument();
  });

  it('disables unchecked options when maxSelections is reached', () => {
    const fieldWithMaxSelections: Field = {
      ...mockField,
      maxSelections: 2,
    };

    const store = createMockStore({
      form: {
        fieldValues: {},
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: { field1: ['option_1', 'option_2'] },
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <MultiSelectPreview field={fieldWithMaxSelections} block={mockBlock} />
      </Provider>
    );

    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    expect(checkboxes[0].disabled).toBe(false); // Selected
    expect(checkboxes[1].disabled).toBe(false); // Selected
    expect(checkboxes[2].disabled).toBe(true);  // Not selected and limit reached
  });

  it('displays error message when error prop is provided', () => {
    const store = createMockStore({
      form: {
        fieldValues: {},
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <MultiSelectPreview 
          field={mockField} 
          block={mockBlock} 
          error="Please select at least one option" 
        />
      </Provider>
    );

    expect(screen.getByText('Please select at least one option')).toBeInTheDocument();
  });

  it('renders children when options are selected', () => {
    const fieldWithChildren: Field = {
      ...mockField,
      options: [
        {
          id: 'opt1',
          label: 'Option 1',
          key: 'option_1',
          children: [
            {
              id: 'child1',
              type: 'text',
              label: 'Child Field 1',
              key: 'child_field_1',
              value: '',
            },
          ],
        },
      ],
    };

    const store = createMockStore({
      form: {
        fieldValues: {},
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: { field1: ['option_1'] },
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <MultiSelectPreview field={fieldWithChildren} block={mockBlock} />
      </Provider>
    );

    expect(screen.getByText('Option 1 Options:')).toBeInTheDocument();
    expect(screen.getByText('Child Field 1')).toBeInTheDocument();
  });

  it('shows children for all selected options', () => {
    const fieldWithChildren: Field = {
      ...mockField,
      options: [
        {
          id: 'opt1',
          label: 'Option 1',
          key: 'option_1',
          children: [
            {
              id: 'child1',
              type: 'text',
              label: 'Child Field 1',
              key: 'child_field_1',
              value: '',
            },
          ],
        },
        {
          id: 'opt2',
          label: 'Option 2',
          key: 'option_2',
          children: [
            {
              id: 'child2',
              type: 'text',
              label: 'Child Field 2',
              key: 'child_field_2',
              value: '',
            },
          ],
        },
      ],
    };

    const store = createMockStore({
      form: {
        fieldValues: {},
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: { field1: ['option_1', 'option_2'] },
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <MultiSelectPreview field={fieldWithChildren} block={mockBlock} />
      </Provider>
    );

    expect(screen.getByText('Option 1 Options:')).toBeInTheDocument();
    expect(screen.getByText('Child Field 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2 Options:')).toBeInTheDocument();
    expect(screen.getByText('Child Field 2')).toBeInTheDocument();
  });

  it('dispatches setClearedField when selection changes', () => {
    const store = createMockStore({
      form: {
        fieldValues: {},
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <MultiSelectPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    const state = store.getState();
    expect(state.form.clearedFields.field1).toBe(true);
  });

  it('does not render children when renderChildrenInParent is true', () => {
    const fieldWithChildren: Field = {
      ...mockField,
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
    };

    const store = createMockStore({
      form: {
        fieldValues: {},
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: { field1: ['option_1'] },
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <MultiSelectPreview 
          field={fieldWithChildren} 
          block={mockBlock} 
          renderChildrenInParent={true}
        />
      </Provider>
    );

    expect(screen.queryByText('Child Field')).not.toBeInTheDocument();
  });

  it('handles empty multiSelectValues array', () => {
    const store = createMockStore({
      form: {
        fieldValues: {},
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: { field1: [] },
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <MultiSelectPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    checkboxes.forEach(checkbox => {
      expect(checkbox.checked).toBe(false);
    });
  });
});