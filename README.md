<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://www.mgm-tp.com/global-content/cd/logos/a12/app-icons/dark/A12-Dark.svg" />
  <img src="https://www.mgm-tp.com/global-content/cd/logos/a12/app-icons/light/A12-Light.svg" height="200" alt="A12 logo" />
</picture>

# Client

This is the repository of the A12 Client library.

The focus of the A12 Client is to provide a model-driven, extensible client runtime.

It's main function is the orchestration of other UI components, especially A12 Engines.

It is based on the technologies React and Redux, and implemented using Typescript.

Refer to https://geta12.com/#/docs to get started with A12 development

---

## License

Parts of the A12 platform are made available under a **dual license**.
Please check the [LICENSE](./LICENSE) file for details.

---

## Packages Documentation

- core - the client library
- appmodel-migration - the migration tool for the application model
- codemod - code mods for recent breaking changes
- data - experimental data access library
- documentation - developer focused documentation of the client library
- devapp - development application showcasing client features

---

## Getting Started

### How to Use It

To install the latest client core package via pnpm:

```sh
pnpm install @com.mgmtp.a12.client/client-core
```

Mind to provide the peer dependencies.

### How to Build and Run

The following tasks can be executed in the repository root or in individual folders to build specific sub-projects.

#### Prerequisites

The following tools are mandatory in order to build this repository.

| Tool     | Version |
| -------- | ------: |
| [Node]   |   `^24` |
| [pnpm]   |   `^11` |
| [JDK]    |   `^25` |
| [Gradle] |    `^9` |

#### Install Dependencies

```sh
pnpm install
```

#### How to Build

```sh
pnpm compile
```

#### How to Test

```sh
pnpm test
```

#### Cleaning Build Artifacts

```sh
pnpm clean
```

#### Code Quality

```sh
pnpm verify
```

#### How to Run

To start the development application, that showcases some of the client library features, first navigate to the devapp dir:

```sh
cd devapp
```

Then start the application:

```sh
pnpm start
```

#### How to Access It

The application will be accessible at <http://localhost:8080>.

By default, it runs with a mocked backend.

---

### Documentation

- Full technical documentation is available at [GetA12.com](https://GetA12.com).
- The website also provides access to the **A12 Discourse Community Forum**.

---

**The mgm A12 Team**

[mgm technology partners GmbH](https://www.mgm-tp.com) | [Imprint](https://www.mgm-tp.com/imprint.html)

<!--- References--->

[Node]: https://nodejs.org/en/docs/
[pnpm]: https://pnpm.io/motivation
[JDK]: https://www.oracle.com/technetwork/java/javase/overview/index.html
[Gradle]: https://docs.gradle.org/
