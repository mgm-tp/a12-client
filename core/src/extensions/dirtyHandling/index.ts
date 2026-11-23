// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

/**
 * This package contains all necessary components to enable the dirty handling of activities.
 *
 * It provides a default implementation for the user interaction to decide between discarding and aborting the
 * cancellation of "dirty" activities and the handling of that decision.
 *
 * To fully enable the dirty handling feature, the view component (e.g. as a wrapper component around the application
 * layout component) and the sagas (as an additional platform sagas for the application setup routine) for the
 * background handling have to be provided.
 *
 * @packageDocumentation
 */
export { withDirtyHandling } from "./internal/applicationFactory.js";
export type { ApplicationWithDirtyHandlingConfig } from "./internal/applicationFactory.js";
export type { VetoDialogProps } from "./internal/components/VetoDialog.js";
export { DirtyHandlingFactories } from "./internal/factories.js";
export { RESOURCE_KEYS as DIRTY_HANDLING_RESOURCE_KEYS } from "./internal/languages/index.js";
export { DirtyHandlingViews } from "./internal/views.js";
