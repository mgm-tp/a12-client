// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Module } from "@com.mgmtp.a12.client/client-core";

import DataEditorModule from "./dataEditor/index.js";
import DataWithoutModelModule from "./dataWithoutModel/index.js";
import DirtyHandlingModule from "./dirtyHandling/index.js";
import HeterogeneityModule from "./heterogeneity/index.js";
import { MultipleDataHoldersModule } from "./multiple-data-holders/index.js";
import NoModelInstanceModule from "./noModelInstance/no-model-instance.js";
import { DataSagaHandlingModule } from "./sagas/index.js";

const DataHandlingModules: Module[] = [
	DataEditorModule,
	NoModelInstanceModule,
	DataWithoutModelModule,
	DirtyHandlingModule,
	HeterogeneityModule,
	MultipleDataHoldersModule,
	DataSagaHandlingModule
];

export default DataHandlingModules;
