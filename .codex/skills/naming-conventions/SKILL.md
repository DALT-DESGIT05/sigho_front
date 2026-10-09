---
name: naming-conventions
description: Apply this project's TypeScript naming convention when creating or modifying variables, methods, properties, and classes.
---

# Naming Conventions

Use this skill for TypeScript and Angular code in this repository.

- Name variables, properties, parameters, signals, methods, and functions in `snake_case`: `fecha_atencion`, `listar_comprobantes()`.
- Name classes in `Capitalized_snake_case`: start every name with an uppercase letter and separate words with underscores, for example `My_voucher_pending_component`.
- Create components described as common or general in `src/app/components`; keep components that belong only to one feature within that feature module.
- Create page components in `src/app/modules/<nombre_modulo>`; use a `pages/` subfolder there when the module already follows that structure.
- Place reusable interfaces in `src/app/interfaces`. Keep an interface next to a component only when it is strictly private to that component.
- Place services in `src/app/services`.
- Place HTTP interceptors in `src/app/interceptors`.
- Place route guards in `src/app/guards`.
- Define shared constants in `src/app/config/constants.ts`.
- Place enums in `src/app/enums`.
- Place shared application layouts and templates in `src/app/layout`.
- Put project-wide utility methods in `src/app/services/util.service.ts`.
- Put interfaces for common or generic components in `src/app/interfaces/util.interface.ts`.
- Place reusable validators in `src/app/validators`.
- Define API environment variables in `src/environments/environments.ts`.
- When creating or modifying any component, use only existing `--palette-*` variables from `src/styles.scss` for colors. Do not add color literals, create new palette variables, or use `--client-*` variables in component styles.
- Keep framework, library, API, and DOM names unchanged when their spelling is imposed externally (`FormGroup`, `ngOnInit`, `formControlName`, third-party payload fields).
- When renaming an existing local symbol, update every internal TypeScript and template reference in the same change. Do not make broad naming-only refactors unless requested.
