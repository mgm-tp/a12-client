/*
 * SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
 *
 * Copyright (c) 2012-2026 mgm technology partners GmbH
 *
 * Dual License
 * ------------
 * This source file is part of the mgm A12 Platform and available under
 * a choice of two different licenses:
 *
 * 1. Open-Source License – EUPL v1.2
 *    You may redistribute and/or modify this file under the terms of the
 *    European Union Public License, version 1.2 - see https://eupl.eu/.
 *
 * 2. Commercial License
 *    Alternatively, you may obtain a commercial license from
 *    mgm technology partners GmbH, that permits use of this software
 *    under different terms (including support and maintenance services).
 *
 *    Please contact a12-license@mgm-tp.com for more information.
 *
 * You must select and comply with exactly one of the above license options.
 *
 * Warranty Disclaimer (applies to either option)
 * ----------------------------------------------
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

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
