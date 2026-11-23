// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

/**
 * In this package the api for the external and internal data handling of the Client is defined.
 *
 * It describes DataLoaders,
 * which are responsible for the data handling between the Client and external sources.
 *
 * Additionally it describes DataEditors,
 * which are responsible for the internal Client data handling between Client activities.
 *
 * Finally, it describes DataProviders. These can be used for
 * all kind of data handling, i.e. internal as well as external. Each data provider is implemented
 * as a redux saga function and thus can interact with the Redux store.
 *
 * @packageDocumentation
 */
export type { DataEditor } from "./internal/DataEditor.js";
export { isDataEditor, isDataLoader, isDataProvider } from "./internal/DataHandler.js";
export type { DataHandler } from "./internal/DataHandler.js";
export { DataLoader } from "./internal/DataLoader.js";
export type { DataProvider } from "./internal/DataProvider.js";
