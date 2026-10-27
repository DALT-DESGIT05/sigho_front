---
name: angular-signals
description: Use Angular Signals as the reactive state model for new or modified Sigho Front components and services.
---

# Angular Signals

Use Angular Signals for application and UI state in every new or modified Angular feature.

- Use current, supported APIs from the installed Angular version. Do not introduce deprecated APIs or a legacy alternative when Angular provides a newer replacement.
- Store mutable local state in `signal()` and derive state with `computed()`.
- Use `input()`, `model()`, and `output()` for component APIs. Do not introduce decorator-based `@Input()` or `@Output()` APIs in new code.
- Keep state private unless a component or service intentionally exposes a readonly signal.
- Use `effect()` only for required side effects; do not use it to derive state that `computed()` can express.
- Do not use `Subject` or `BehaviorSubject` as application or UI state. When an external Observable must be consumed by the UI, bridge it with Angular's signal interop and keep the resulting state as a signal.
- Use Signal Forms for every form; do not introduce Reactive Forms, `FormGroup`, `FormControl`, `ngModel`, or `FormsModule` for form state.
- Keep existing non-signal code unchanged unless its migration is requested.
- For user-input forms, also follow the `signal-forms` skill.
