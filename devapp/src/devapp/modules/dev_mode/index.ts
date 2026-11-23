// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

/**
 * A module for development mode views.
 */
import type { SampleAppModule } from "../../utils/SampleAppModule.js";

import { ActivityReducerModule } from "./activitiesReducer.js";
import DynamicModule from "./dynamic-module/index.js";

export const DevModeModules: SampleAppModule[] = [DynamicModule, ActivityReducerModule];

export default DevModeModules;
