// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { SimpleFormFactories } from "../mocks/SimpleForm/index.js";
import { SimpleOverviewFactories } from "../mocks/SimpleOverview/index.js";
import type { SampleAppModule } from "../utils/SampleAppModule.js";

import AboutModules from "./about/index.js";
import DataHandlingModules from "./data_handling/index.js";
import ErrorHandlingModules from "./error_handling/index.js";
import ExampleModules from "./examples/index.js";
import { LandingPageModule } from "./landingPage/index.js";
import UIHandlingModules from "./ui_handling/index.js";

export const SampleAppModules: SampleAppModule[] = [
	LandingPageModule,
	...DataHandlingModules,
	...UIHandlingModules,
	...ErrorHandlingModules,
	...ExampleModules,
	...AboutModules,
	SimpleFormFactories.createModule(),
	SimpleOverviewFactories.createModule()
];
