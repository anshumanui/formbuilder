import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import TextFieldPreview from '../TextFieldPreview';
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
  type: 'text',
  label: 'Test Field',
  key: 'test_field',
  value: '',
  placeholder: 'Enter text',
};

const mockBlock: Block = {
  id: 'block1',
  field: mockField,
  separateBlock: false,
};

describe('TextFieldPreview', () => {
  it('renders text input with placeholder', () => {
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
        <TextFieldPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('displays field value from Redux store', () => {
    const store = createMockStore({
      form: {
        fieldValues: { field1: 'Test Value' },
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <TextFieldPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    const input = screen.getByPlaceholderText('Enter text') as HTMLInputElement;
    expect(input.value).toBe('Test Value');
  });

  it('dispatches setFieldValue action on input change', () => {
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
        <TextFieldPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    const input = screen.getByPlaceholderText('Enter text');
    fireEvent.change(input, { target: { value: 'New Value' } });

    const state = store.getState();
    expect(state.form.fieldValues.field1).toBe('New Value');
  });

  it('renders icon on the left when iconAlignment is left', () => {
    const fieldWithIcon: Field = {
      ...mockField,
      icon: '📧',
      iconAlignment: 'left',
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
        <TextFieldPreview field={fieldWithIcon} block={mockBlock} />
      </Provider>
    );

    expect(screen.getByText('📧')).toBeInTheDocument();
  });

  it('renders icon on the right when iconAlignment is right', () => {
    const fieldWithIcon: Field = {
      ...mockField,
      icon: '📧',
      iconAlignment: 'right',
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
        <TextFieldPreview field={fieldWithIcon} block={mockBlock} />
      </Provider>
    );

    expect(screen.getByText('📧')).toBeInTheDocument();
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
        <TextFieldPreview 
          field={mockField} 
          block={mockBlock} 
          error="This field is required" 
        />
      </Provider>
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('respects maxChars attribute', () => {
    const fieldWithMaxChars: Field = {
      ...mockField,
      maxChars: 10,
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
        <TextFieldPreview field={fieldWithMaxChars} block={mockBlock} />
      </Provider>
    );

    const input = screen.getByPlaceholderText('Enter text') as HTMLInputElement;
    expect(input.maxLength).toBe(10);
  });

  it('clears field when setClearedField is dispatched', () => {
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
        <TextFieldPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    const input = screen.getByPlaceholderText('Enter text');
    fireEvent.change(input, { target: { value: 'Test' } });

    const state = store.getState();
    expect(state.form.clearedFields.field1).toBe(true);
  });
});