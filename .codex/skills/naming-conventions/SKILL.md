---
name: naming-conventions
description: Apply the Sigho Front naming rules for TypeScript symbols, Angular classes, and file suffixes.
---

# Naming Conventions

Use this skill for TypeScript and Angular code in this repository.

- Name variables, properties, parameters, signals, methods, and functions in `snake_case`: `fecha_atencion`, `listar_comprobantes()`.
- Name classes in PascalCase. Build the class name from the file's kebab-case base name and its type suffix: `detalle-venta.components.ts` declares `DetalleVentaComponents`; `producto.service.ts` declares `ProductoService`.
- Keep framework, library, API, DOM, and third-party payload names unchanged when their spelling is imposed externally.
- When renaming an existing local symbol, update every internal TypeScript and template reference in the same change. Do not make broad naming-only refactors unless requested.

## Readable methods

- Write methods with readable multi-line control flow. Do not compress conditions and actions into a one-line statement.
- Use braces and early returns when they clarify a guard condition. For example:

```ts
onClick(event: MouseEvent): void {
  if (this.disabled() || this.loading()) {
    return;
  }

  this.clicked.emit(event);
}
```

## File names and class suffixes

Use kebab-case for the base name and the exact suffix for its artifact type.

| Artifact | File name | Class name |
| --- | --- | --- |
| Component | `detalle-venta.components.ts` | `DetalleVentaComponents` |
| Service | `producto.service.ts` | `ProductoService` |
| Directive | `resaltar.directive.ts` | `ResaltarDirective` |
| Pipe | `fecha-local.pipe.ts` | `FechaLocalPipe` |
| Guard | `autenticacion.guard.ts` | `AutenticacionGuard` |
| Interceptor | `token.interceptor.ts` | `TokenInterceptor` |
| Resolver | `venta.resolver.ts` | `VentaResolver` |
| Interface | `producto.interface.ts` | `ProductoInterface` |
| Model | `producto.model.ts` | `ProductoModel` |
| Enum | `estado-venta.enum.ts` | `EstadoVentaEnum` |

Component companion files use the same base and suffix: `detalle-venta.components.html`, `detalle-venta.components.scss`, and `detalle-venta.components.spec.ts`.

## Component tests

- Every new component includes its corresponding `.components.spec.ts` test.
- When a component is modified, update its test in the same change and run the focused test that covers it.

## Component styles

- A component with a particular visual design keeps its styles in its own `.components.scss` file.
- Keep component styles focused on that component. When the required styling or behavior grows beyond the component's responsibility, stop and report that it should be extracted into a dedicated component instead of accumulating a large stylesheet.

## Confirmation of data mutations

- A button that triggers a query, insertion, update, or deletion must request user confirmation before calling its service.
- Use the standard `MESSAGE_CONFIRMATION_DEFAULT` text exported by `src/app/config/constants.ts`; do not hardcode a confirmation question in a component.

## HTTP error messages

- Display every HTTP 409 custom business-error message through SweetAlert2. Use the message returned by the API when it is available.
- Display HTTP 422 validation messages beneath the field or component they apply to. Do not present validation errors in SweetAlert2.

## Service interfaces

- Every service defines and uses its own interfaces for its data contracts.
- Do not reuse, extend, inherit, or create a shared substitute for an interface owned by another service, even when the fields are identical.
- Organize services and their interfaces by business module. A service for `cliente` belongs in `src/app/services/cliente/`, and each of its interfaces belongs in `src/app/interfaces/cliente/`.
- Keep the API calls of a service and the interfaces that define their contracts inside their corresponding business-module folders; do not place them directly in the root `services` or `interfaces` directories.

## Fixed locations

| Artifact | Location |
| --- | --- |
| Guards | `src/app/guards/` |
| HTTP interceptors | `src/app/interceptors/` |
| Services | `src/app/services/<nombre_modulo>/` |
| Service interfaces | `src/app/interfaces/<nombre_modulo>/` |
| Environments | `src/environments/` |
| Shared layouts and templates | `src/app/layout/` |

## General components and colors

- Store general components in `src/app/components`. They are reusable from any part of the application.
- A general component that internally consumes an API through a service is a general business component. Keep it in `src/app/components` as well; do not move it into a feature solely because it consumes a service.
- A new general component must provide a genuinely new reusable capability. Compose it from existing general components whenever one already supplies a needed element; for example, consume the shared button component instead of recreating a button inside it.
- Before creating a component, reuse the shared configuration and utilities in `src/app/interfaces/util.interface.ts` and `src/app/services/util.service.ts`. Do not redefine their existing concepts locally.
- Use `PaletteColor` for colors, `ComponentSize` for component and typography size, and `ButtonAction` plus its related types for button actions. Reuse the existing `UtilService` behavior when it covers the required utility.
- Put a new method that will be reused across the project in the appropriate shared service, never in an individual component. Use `src/app/services/util.service.ts` for general utilities such as text formatting; use an existing specialized service such as `image.service.ts` or `date.service.ts` when the method belongs to that domain.
- Every general component keeps an up-to-date `README.md` in its own folder. Document its purpose, selector, public inputs/outputs/models, dependencies or required configuration, and at least one practical usage example.
- Update that component documentation in the same change whenever its public API or integration behavior changes.
- Use only the existing `--palette-*` color variables declared in the `/* Paleta original de los componentes compartidos. */` block in `src/styles.scss`.
- Do not add, rename, or redefine palette variables. Do not use color literals or other color variables in component styles.

## Feature modules, pages, and child components

- Place each page in `src/app/modules/<nombre_modulo>/pages/<nombre_componente_page>/`.
- If a page has child components that belong only to that module's business flow, place them in `src/app/modules/<nombre_modulo>/components/<nombre_componente_page>/<nombre_componente_hijo>/`.
- Do not place a module-exclusive child component in `src/app/components`. Reserve that directory for components that are reusable throughout the application.
