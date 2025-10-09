import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CheckboxPreview from '../CheckboxPreview';
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
  type: 'checkbox',
  label: 'Test Checkbox',
  key: 'test_checkbox',
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

describe('CheckboxPreview', () => {
  it('renders all checkbox options', () => {
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
        <CheckboxPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('checks checkbox on click', () => {
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
        <CheckboxPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    const checkbox = screen.getByDisplayValue('option_1') as HTMLInputElement;
    fireEvent.click(checkbox);

    const state = store.getState();
    expect(state.form.checkedOptions.opt1).toBe(true);
  });

  it('unchecks checkbox when clicked again', () => {
    const store = createMockStore({
      form: {
        fieldValues: {},
        selectedOptions: {},
        checkedOptions: { opt1: true },
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <CheckboxPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    const checkbox = screen.getByDisplayValue('option_1') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
    
    fireEvent.click(checkbox);

    const state = store.getState();
    expect(state.form.checkedOptions.opt1).toBe(false);
  });

  it('shows checked state from Redux store', () => {
    const store = createMockStore({
      form: {
        fieldValues: {},
        selectedOptions: {},
        checkedOptions: { opt1: true, opt3: true },
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <CheckboxPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    const checkbox1 = screen.getByDisplayValue('option_1') as HTMLInputElement;
    const checkbox2 = screen.getByDisplayValue('option_2') as HTMLInputElement;
    const checkbox3 = screen.getByDisplayValue('option_3') as HTMLInputElement;

    expect(checkbox1.checked).toBe(true);
    expect(checkbox2.checked).toBe(false);
    expect(checkbox3.checked).toBe(true);
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
        <CheckboxPreview 
          field={mockField} 
          block={mockBlock} 
          error="Please select at least one option" 
        />
      </Provider>
    );

    expect(screen.getByText('Please select at least one option')).toBeInTheDocument();
  });

  it('renders children when checkbox is checked', () => {
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
        checkedOptions: { opt1: true },
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <CheckboxPreview field={fieldWithChildren} block={mockBlock} />
      </Provider>
    );

    expect(screen.getByText('Child Field')).toBeInTheDocument();
  });

  it('does not render children when checkbox is unchecked', () => {
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
        checkedOptions: { opt1: false },
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <CheckboxPreview field={fieldWithChildren} block={mockBlock} />
      </Provider>
    );

    expect(screen.queryByText('Child Field')).not.toBeInTheDocument();
  });

  it('supports row placement for options', () => {
    const fieldWithRowPlacement: Field = {
      ...mockField,
      optionsPlacement: 'row',
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

    const { container } = render(
      <Provider store={store}>
        <CheckboxPreview field={fieldWithRowPlacement} block={mockBlock} />
      </Provider>
    );

    const optionsContainer = container.firstChild;
    expect(optionsContainer).toBeInTheDocument();
  });

  it('dispatches setClearedField when checkbox changes', () => {
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
        <CheckboxPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    const checkbox = screen.getByDisplayValue('option_1');
    fireEvent.click(checkbox);

    const state = store.getState();
    expect(state.form.clearedFields.field1).toBe(true);
  });

  it('allows multiple checkboxes to be selected', () => {
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
        <CheckboxPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    const checkbox1 = screen.getByDisplayValue('option_1');
    const checkbox2 = screen.getByDisplayValue('option_2');

    fireEvent.click(checkbox1);
    fireEvent.click(checkbox2);

    const state = store.getState();
    expect(state.form.checkedOptions.opt1).toBe(true);
    expect(state.form.checkedOptions.opt2).toBe(true);
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
        checkedOptions: { opt1: true },
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <CheckboxPreview 
          field={fieldWithChildren} 
          block={mockBlock} 
          renderChildrenInParent={true}
        />
      </Provider>
    );

    expect(screen.queryByText('Child Field')).not.toBeInTheDocument();
  });
});