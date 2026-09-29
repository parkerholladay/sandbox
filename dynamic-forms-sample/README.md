# Open Ed Dynamic Forms

A sample Next.js app for exploring school forms backed by typed, serializable definitions. The current sample forms are student absence reports, field trip permissions, and emergency contacts.

## Form definitions and loading

The shared form and field types live in `services/forms/types.ts`; example definitions are in `services/forms/seed.ts`. A form has a stable `type`, title, optional description, and ordered `fields`. Fields use a discriminated `type`, `name`, and `label`, with optional help text, defaults, required hints, choices, and visibility conditions. Groups store nested objects; repeaters store arrays of objects.

Fields may use `visibleWhen: { field, equals }` to compare with a sibling answer. Inside groups and repeaters that comparison uses the values in the same nested object or repeater entry. Inactive values are removed before schema validation.

Server code loads definitions through `getFormDefinition` and `listFormDefinitions` in `services/forms/service.ts`. Both use `FormDefinitionRepository` in `services/forms/repository.ts`, whose default `SeedFormDefinitionRepository` reads `FORM_DEFINITION_SEEDS` and returns independent copies. The service checks that every returned definition has a registered submission schema. A future database adapter can implement the same asynchronous `list()` and `getByType(type)` methods, then be selected by `getFormDefinitionRepository()`.

## Submission validation

Each seeded form type has a companion Zod schema in `services/forms/schemas.ts`. The shared `getFormSchema(definition)` applies conditional-value pruning and can be passed to `zodResolver` in a client form; `validateFormSubmission(definition, values)` uses the same schema to validate unknown submission data on the server. Validation also enforces date ordering, consent, contact requirements, and allowed choice values. Register a companion schema in `FORM_SUBMISSION_SCHEMAS` when adding a new form type. Only the serializable definition crosses from a Server Component to a Client Component; import shared schema code directly where validation runs.

## Development

Install dependencies with pnpm and start the app with `pnpm dev`. Run the form unit tests with `pnpm test`; run linting with `pnpm lint`; check types with `pnpm exec tsc --noEmit`.
