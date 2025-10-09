import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import SelectPreview from '../SelectPreview';
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
  type: 'select',
  label: 'Test Select',
  key: 'test_select',
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

describe('SelectPreview', () => {
  it('renders select dropdown with default option', () => {
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
        <SelectPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('-- Select --')).toBeInTheDocument();
  });

  it('renders all select options', () => {
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
        <SelectPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('selects option on change', () => {
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
        <SelectPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'option_2' } });

    const state = store.getState();
    expect(state.form.fieldValues.field1).toBe('option_2');
  });

  it('shows selected value from Redux store', () => {
    const store = createMockStore({
      form: {
        fieldValues: { field1: 'option_2' },
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <SelectPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('option_2');
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
        <SelectPreview 
          field={mockField} 
          block={mockBlock} 
          error="Please select an option" 
        />
      </Provider>
    );

    expect(screen.getByText('Please select an option')).toBeInTheDocument();
  });

  it('renders children when option is selected', () => {
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
        fieldValues: { field1: 'option_1' },
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <SelectPreview field={fieldWithChildren} block={mockBlock} />
      </Provider>
    );

    expect(screen.getByText('Child Field')).toBeInTheDocument();
  });

  it('does not render children when no option is selected', () => {
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
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <SelectPreview field={fieldWithChildren} block={mockBlock} />
      </Provider>
    );

    expect(screen.queryByText('Child Field')).not.toBeInTheDocument();
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
        <SelectPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'option_1' } });

    const state = store.getState();
    expect(state.form.clearedFields.field1).toBe(true);
  });

  it('hides children when selection is cleared', () => {
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
        fieldValues: { field1: 'option_1' },
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    const { rerender } = render(
      <Provider store={store}>
        <SelectPreview field={fieldWithChildren} block={mockBlock} />
      </Provider>
    );

    expect(screen.getByText('Child Field')).toBeInTheDocument();

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '' } });

    rerender(
      <Provider store={store}>
        <SelectPreview field={fieldWithChildren} block={mockBlock} />
      </Provider>
    );

    expect(screen.queryByText('Child Field')).not.toBeInTheDocument();
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
        fieldValues: { field1: 'option_1' },
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <SelectPreview 
          field={fieldWithChildren} 
          block={mockBlock} 
          renderChildrenInParent={true}
        />
      </Provider>
    );

    expect(screen.queryByText('Child Field')).not.toBeInTheDocument();
  });

  it('handles empty value correctly', () => {
    const store = createMockStore({
      form: {
        fieldValues: { field1: '' },
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <SelectPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('');
  });
});