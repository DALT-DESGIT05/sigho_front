---
name: signal-forms
description: Create or migrate Angular 22 user-input forms with stable Signal Forms. Use for every form in this project.
---

# Signal Forms

Use Angular 22 Signal Forms for every new or migrated user-input form in this project.

- Import form APIs only from `@angular/forms/signals`.
- Define a typed plain-object form model with `signal<T>()`, create its field tree with `form()`, and bind native controls with `[formField]`.
- Define validation in the `form()` schema with the Signal Forms validators. Read validity, errors, dirty, and touched state from the field tree.
- Keep the model as the single source of truth. Do not duplicate submitted values in unrelated component properties.
- Do not introduce `FormsModule`/`ngModel`, `ReactiveFormsModule`, `FormGroup`, or `FormControl` for a form. Do not mix form systems within the same form.
- A component that only displays data or wraps a control is not itself a form; use Signal Forms when it owns user-entered form state.
- For custom controls, integrate them through the Signal Forms-compatible API rather than adding a parallel `ControlValueAccessor` flow to the same form.
- Test each form’s initial model, validation, field-to-model synchronization, and valid/invalid submission path.

Existing forms remain unchanged unless their migration is requested. If an external library cannot be integrated with Signal Forms, stop and report the limitation instead of silently falling back to another form system.
