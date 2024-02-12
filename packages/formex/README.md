# Formex - React Form Library

Formex is a lightweight, flexible library designed to simplify form handling within React applications. By leveraging React's powerful context and hooks features, Formex allows for efficient form state management with minimal boilerplate code.

## Features

- Lightweight and easy to integrate
- Supports custom field components
- Built-in validation handling
- Provides both field-level and form-level state management

## Installation

To install Formex, you can use either npm or yarn:

```sh
npm install your-formex-package-name

# or if you're using yarn

yarn add your-formex-package-name
```

## Quick Start

To get started with Formex, you first need to create your form context and form controller using the `useCreateFormex` hook. Then, you can structure your form using the `<Field />` components provided by Formex.

### Step 1: Create your form controller

```jsx
import React from 'react';
import { useCreateFormex } from 'formex-library';

const MyForm = () => {
    const formController = useCreateFormex({
        initialValues: {
            name: '',
            email: '',
        },
        // Optionally add a validation function
        // validation: values => {
        //   const errors = {};
        //   if (!values.name) errors.name = 'Name is required';
        //   return errors;
        // },
        onSubmit: (values) => {
            console.log('Form Submitted:', values);
        },
    });

    return (
        <form onSubmit={formController.handleSubmit}>
            {/* Field components go here */}
        </form>
    );
};
```

### Step 2: Use the `<Field />` component

```jsx
import { Field } from 'formex-library';

// Inside your form component
<Field name="name">
  {({ field }) => (
    <input
      {...field}
      placeholder="Your name"
    />
  )}
</Field>

<Field name="email">
  {({ field }) => (
    <input
      {...field}
      type="email"
      placeholder="Your email"
    />
  )}
</Field>

<button type="submit">Submit</button>
```

### Handling Submissions

Wrap your form inputs and submit button within a form element and pass the `submitForm` method from your form controller to the form's `onSubmit` event:

```jsx
<form onSubmit={formController.handleSubmit}>
    {/* Fields and submit button */}
</form>
```

## API Reference

### `useCreateFormex`

Hook to create a form controller.

**Parameters**

- `initialValues`: An object with your form's initial values.
- `initialErrors` (optional): An object for any initial validation errors.
- `validation` (optional): A function for validating form data.
- `validateOnChange` (optional): If `true`, validates fields whenever they change.
- `onSubmit`: A function that fires when the form is submitted.


### `<Field />`

A component used to render individual form fields.

**Props**

- `name`: The name of the form field.
- `as` (optional): The component or HTML tag that should be rendered. Defaults to `"input"`.
- `children`: A function that returns the field input component. Receives field props as its parameter.

**Example**

```jsx
<Field name="username">
  {({ field }) => <input {...field} />}
</Field>
```

## Customization

Formex is designed to be flexible. You can create custom field components, use any validation library, or integrate with UI component libraries.

### Using with UI Libraries

```jsx
import { Field } from 'formex-library';
import { TextField } from 'some-ui-library';

<Field name="username">
  {({ field }) => (
    <TextField {...field} label="Username" />
  )}
</Field>
```

### Custom Validation

Leverage the `validation` function in `useCreateFormex` to integrate any validation logic or library.

```jsx
const validate = values => {
  const errors = {};
  if (!values.email.includes('@')) {
    errors.email = 'Invalid email';
  }
  return errors;
};
```

## Conclusion

Formex provides a simple yet powerful way to manage forms in React applications. It reduces the amount of boilerplate code needed and offers flexibility to work with custom components and validation strategies. Whether you are building simple or complex forms, Formex can help streamline your form management process.

For further examples and advanced usage, refer to the Formex documentation or source code.
