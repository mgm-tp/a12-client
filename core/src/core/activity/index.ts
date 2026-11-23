// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

/**
 * This package contains the infrastructure for dealing with activities.
 *
 * It provides the specification of an Activity itself and the ActivityMap.
 * The activity map is the data structure that saves all activities in the redux
 * store.
 *
 * Besides, it provides three more modules. ActivityActions and
 * ActivityReducers trigger state changes in the store.
 * ActivitySelectors retrieve activity-related data from the store.
 *
 * @packageDocumentation
 */
export { ActivityActions } from "./internal/actions.js";
export { ActivityLenses } from "./internal/activity-lenses.js";
export { Activity } from "./internal/activity.js";
export { ActivityMap } from "./internal/activityMap.js";
export { ActivityReducers } from "./internal/reducers/index.js";
export { ActivitySagas } from "./internal/sagas.js";
export { ActivitySelectors } from "./internal/selectors.js";
