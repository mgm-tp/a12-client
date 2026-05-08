# Writing tests for the Client

## How to?

### How to test that an error is thrown without getting a error stack-trace on the console?

Use the utility function `stubConsoleErrors`.

### How to create a store?
Use `createGeneralStore` from `src\test\mocks\store\store.ts` to create a general store. This store will create an app-model which already has two scenes, one for the overview-engine and one for the form-engine.
You can hand over additional modules, to create an app-model like you need it.
If this does not fit your needs, please try to adapt the function instead of writing your own.

### How to create an activity?
Use `createActivity` from `src\test\utils\activity.ts`. 
If the function does not fit your needs, please try to adapt it instead of writing your own.