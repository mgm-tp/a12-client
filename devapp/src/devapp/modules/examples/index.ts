// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Module } from "@com.mgmtp.a12.client/client-core";

import ActivityReplacementModule from "./activity-replacement/index.js";
import { DynamicConfigurationExampleModule } from "./dynamic-configuration/index.js";
import DynamicModelsModule from "./dynamic-models/index.js";
import CustomFocusModule from "./focus-handling/index.js";
import InitialDataModule from "./initialData/index.js";
import MaximizeFormModule from "./maximize-form/index.js";
import ModelDrivenDialogModule from "./model-driven-dialog/index.js";
import MultipleModelsModule from "./multiple-models.js";
import FocusHandlingProgressIndicatorModule from "./progress-indicator-focus-handling/index.js";
import SagaOverrideModule from "./sagaOverride/index.js";
import BackgroundSagaModule from "./simpleSaga/index.js";

const ExampleModules: Module[] = [
	DynamicConfigurationExampleModule,
	ActivityReplacementModule,
	ModelDrivenDialogModule,
	MaximizeFormModule,
	InitialDataModule,
	MultipleModelsModule,
	BackgroundSagaModule,
	SagaOverrideModule,
	CustomFocusModule,
	FocusHandlingProgressIndicatorModule,
	DynamicModelsModule
];

export default ExampleModules;
