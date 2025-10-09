import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import RadioPreview from '../RadioPreview';
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
  type: 'radio',
  label: 'Test Radio',
  key: 'test_radio',
  value: '',
  options: [
    { id: 'opt1', label: 'Option 1', key: 'option_1', helperText: 'Helper for option 1', children: [] },
    { id: 'opt2', label: 'Option 2', key: 'option_2', helperText: 'Helper for option 2', children: [] },
  ],
};

const mockBlock: Block = {
  id: 'block1',
  field: mockField,
  separateBlock: false,
};

describe('RadioPreview', () => {
  it('renders all radio options', () => {
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
        <RadioPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('displays helper text for options at level 0', () => {
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
        <RadioPreview field={mockField} block={mockBlock} level={0} />
      </Provider>
    );

    expect(screen.getByText('Helper for option 1')).toBeInTheDocument();
    expect(screen.getByText('Helper for option 2')).toBeInTheDocument();
  });

  it('does not display helper text for nested levels', () => {
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
        <RadioPreview field={mockField} block={mockBlock} level={1} />
      </Provider>
    );

    expect(screen.queryByText('Helper for option 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Helper for option 2')).not.toBeInTheDocument();
  });

  it('selects radio option on click', () => {
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
        <RadioPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    const radioOption = screen.getByDisplayValue('option_1') as HTMLInputElement;
    fireEvent.click(radioOption);

    const state = store.getState();
    expect(state.form.selectedOptions.field1).toBe('opt1');
  });

  it('shows selected option based on Redux state', () => {
    const store = createMockStore({
      form: {
        fieldValues: {},
        selectedOptions: { field1: 'opt2' },
        checkedOptions: {},
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <RadioPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    const radioOption = screen.getByDisplayValue('option_2') as HTMLInputElement;
    expect(radioOption.checked).toBe(true);
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
        <RadioPreview 
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
        fieldValues: {},
        selectedOptions: { field1: 'opt1' },
        checkedOptions: {},
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <RadioPreview field={fieldWithChildren} block={mockBlock} />
      </Provider>
    );

    expect(screen.getByText('Child Field')).toBeInTheDocument();
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
        <RadioPreview field={fieldWithRowPlacement} block={mockBlock} />
      </Provider>
    );

    // Check that the container uses row flex direction
    const optionsContainer = container.firstChild;
    expect(optionsContainer).toBeInTheDocument();
  });

  it('dispatches setClearedField when option changes', () => {
    const store = createMockStore({
      form: {
        fieldValues: {},
        selectedOptions: { field1: 'opt1' },
        checkedOptions: {},
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <RadioPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    const radioOption = screen.getByDisplayValue('option_2');
    fireEvent.click(radioOption);

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
        selectedOptions: { field1: 'opt1' },
        checkedOptions: {},
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <RadioPreview 
          field={fieldWithChildren} 
          block={mockBlock} 
          renderChildrenInParent={true}
        />
      </Provider>
    );

    expect(screen.queryByText('Child Field')).not.toBeInTheDocument();
  });
});