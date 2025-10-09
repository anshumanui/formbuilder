import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import TextareaPreview from '../TextareaPreview';
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
  type: 'textarea',
  label: 'Test Textarea',
  key: 'test_textarea',
  value: '',
  placeholder: 'Enter description',
};

const mockBlock: Block = {
  id: 'block1',
  field: mockField,
  separateBlock: false,
};

describe('TextareaPreview', () => {
  it('renders textarea with placeholder', () => {
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
        <TextareaPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    const textarea = screen.getByPlaceholderText('Enter description');
    expect(textarea).toBeInTheDocument();
  });

  it('displays field value from Redux store', () => {
    const store = createMockStore({
      form: {
        fieldValues: { field1: 'Test Description' },
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <TextareaPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    const textarea = screen.getByPlaceholderText('Enter description') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Test Description');
  });

  it('dispatches setFieldValue action on textarea change', () => {
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
        <TextareaPreview field={mockField} block={mockBlock} />
      </Provider>
    );

    const textarea = screen.getByPlaceholderText('Enter description');
    fireEvent.change(textarea, { target: { value: 'New Description' } });

    const state = store.getState();
    expect(state.form.fieldValues.field1).toBe('New Description');
  });

  it('displays character counter when maxChars is set', () => {
    const fieldWithMaxChars: Field = {
      ...mockField,
      maxChars: 100,
    };

    const store = createMockStore({
      form: {
        fieldValues: { field1: 'Test' },
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <TextareaPreview field={fieldWithMaxChars} block={mockBlock} />
      </Provider>
    );

    expect(screen.getByText('4 / 100')).toBeInTheDocument();
  });

  it('does not allow input beyond maxChars limit', () => {
    const fieldWithMaxChars: Field = {
      ...mockField,
      maxChars: 10,
    };

    const store = createMockStore({
      form: {
        fieldValues: { field1: '1234567890' },
        selectedOptions: {},
        checkedOptions: {},
        multiSelectValues: {},
        clearedFields: {},
        isSubmitted: false,
      },
    });

    render(
      <Provider store={store}>
        <TextareaPreview field={fieldWithMaxChars} block={mockBlock} />
      </Provider>
    );

    const textarea = screen.getByPlaceholderText('Enter description');
    fireEvent.change(textarea, { target: { value: '12345678901' } });

    const state = store.getState();
    // Should still be the old value since it exceeds maxChars
    expect(state.form.fieldValues.field1).toBe('1234567890');
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
        <TextareaPreview 
          field={mockField} 
          block={mockBlock} 
          error="This field is required" 
        />
      </Provider>
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('respects maxLength attribute on textarea', () => {
    const fieldWithMaxChars: Field = {
      ...mockField,
      maxChars: 50,
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
        <TextareaPreview field={fieldWithMaxChars} block={mockBlock} />
      </Provider>
    );

    const textarea = screen.getByPlaceholderText('Enter description') as HTMLTextAreaElement;
    expect(textarea.maxLength).toBe(50);
  });

  it('updates character counter as user types', () => {
    const fieldWithMaxChars: Field = {
      ...mockField,
      maxChars: 100,
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
        <TextareaPreview field={fieldWithMaxChars} block={mockBlock} />
      </Provider>
    );

    const textarea = screen.getByPlaceholderText('Enter description');
    fireEvent.change(textarea, { target: { value: 'Hello World' } });

    expect(screen.getByText('11 / 100')).toBeInTheDocument();
  });
});