# A12 Client DevApp

This is an application used for the development of the A12 Client library.

It demonstrates various A12 Client features like:

- a dashboard which uses the Dashboard Widget to display information and interactive tiles
- displaying data in UI components
- dirty state handling
- error handling

Disclaimer: This application is only meant for A12 Client development and documentation purposes. It doesn't follow security best practices and is not configured for a production environment.

## Getting Started

### How to Build and Run

The devapp is built as part of the client monorepo build.
Follow the instructions in the root [README.md](../README.md)

### How to Create a Distributable

Run in the devapp directory

```{shell}
pnpm build
```

The resulting dist directory can be served as a static page, e.g. via

```{shell}
pnpm dlx serve ./dist
```

---

### Documentation

#### Run Profiles

By default the devapp is started with the **mock** profile, i.e. using a mocked backend not supporting real CRUD operations.

Use the **platform** profile to run the devapp with a simple A12 backend with in-memory db and local authentication for simplicity.

To start the devapp with a platform server with in-memory db run:

```{shell}
pnpm start:platform
```

The backend is running under localhost:9090.

#### Special Functionality

##### Action Sequences

The devapp comes with Action sequences, that can be used to test and showcase more complex features. They can be executed manually through the browser console.

To run action sequence `SEQUENCE_NAME` with an optional delay of `TIME_IN_SEC` between actions:

```{shell}
steps["SEQUENCE_NAME"].run(TIME_IN_SEC)
```

To run all action sequences with an optional delay of `TIME_IN_SEC` between actions:

```{shell}
steps.runAll(TIME_IN_SEC)
```

#### Development Notes

##### Validation Generation

The example models for the devapp are pre-processed automatically on start.

After a model change:

- When running in mock mode, just the page needs to be reloaded after a model change, as the pre-processing is triggered automatically on change.

- When running in platform mode, the backend needs to be restarted. It handles the model pre-processing itself.

You can also manually trigger the model processing after you changed the example Document Models found in the `resources/models` folder. This includes model conversion, A12 Kernel validation code generation and recreation of the model graph.

For this, run

```{shell}
gradle generateModelGraph
```
