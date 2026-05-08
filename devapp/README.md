<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://www.mgm-tp.com/global-content/cd/logos/a12/app-icons/dark/A12-Dark.svg" />
  <img src="https://www.mgm-tp.com/global-content/cd/logos/a12/app-icons/light/A12-Light.svg" height="200" alt="A12 logo" />
</picture>

# A12 Client Devapp

This is an application used for the development of the A12 Client library.

> The focus of the A12 Client is to provide a model-driven, extensible client runtime.
>
> It's main function is the orchestration of other UI components, especially A12 Engines.
>
> It is based on the technologies React and Redux, and implemented using Typescript.

The application demonstrates various A12 Client features like:

- a dashboard which uses the Dashboard Widget to display information and interactive tiles
- displaying data in UI components
- dirty state handling
- error handling

Disclaimer: This application is only meant for A12 Client development and documentation purposes. It doesn't follow security best practices and is not configured for a production environment.

---

The A12 Client is part of the mgm A12 low code business application platform.

Refer to https://geta12.com/#/docs to get started with A12 development.

---

## License
Parts of the A12 platform are made available under a **dual license**.  
Please check the [LICENSE](./LICENSE) file for details.

---

## Getting Started

### How to Build and Run

#### Prerequisites

The following tools are mandatory in order to build the dev app.

| Tool     | Version |
| -------- | ------: |
| [JDK]    |   `^21` |
| [Gradle] |    `^8` |
| [Node]   |   `^24` |
| [npm]    |   `^11` |

#### How to Build

Install the dependencies with

```{shell}
npm install --legacy-peer-deps
```

Note: The legacy-peer-deps flag is currently necessary to work around a compatibility issue.

Initialize the example models via

```{shell}
npm run init
```

Build the devapp with

```{shell}
npm run build
```

The resulting dist folder can be served as a static page via a webserver.

#### How to Run

```{shell}
npm start
```

By default, the devapp is running with the profile "mock" and will therefore not support real CRUD functionality. Please read more in section [Run Profiles](#run-profiles).

#### How to Access It

The app will be accessible at <http://localhost:8080>.

---

### Documentation

- Full technical documentation is available at [GetA12.com](https://GetA12.com).
- The website also provides access to the **A12 Discourse Community Forum**.

#### Run Profiles

There are two profiles for running the devapp:

- **mock** (default): no backend is started, the visible data is mocked, CRUD actions don't have an effect
- **platform**: a simple A12 backend is used. Local authentication is configured for simplicity.

To start the devapp without a platform server (mock profile):

```{shell}
npm run start:mock
```

To start the devapp with a platform server with in-memory db run:

```{shell}
npm run start:platform
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

After changing the example Document Models found in the `resources/models` folder, model conversion, A12 Kernel validation code generation and recreation of the model graph should be executed by running

```{shell}
gradle generateModelGraph
```

---

## Contributing

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to get involved.

---

## Support

For details on community and enterprise support, response times, and ticket requirements, please refer to [SUPPORT.md](./SUPPORT.md).

---

**A12 Team**

**mgm technology partners GmbH**

[Website](https://www.mgm-tp.com) • [Imprint](https://www.mgm-tp.com/imprint.html) • info@mgm-tp.com

<!--- References--->

[JDK]: https://www.oracle.com/technetwork/java/javase/overview/index.html
[Gradle]: https://docs.gradle.org/
[Node]: https://nodejs.org/en/docs/
[npm]: https://docs.npmjs.com/
