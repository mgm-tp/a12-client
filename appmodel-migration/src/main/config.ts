// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { MigrationParameters } from "@com.mgmtp.a12.migrationtool/migrationtool-core/types";

// @ts-ignore
import { MIGRATION_STEPS } from "./steps/index.js";

/** @internal */
export const MIGRATION_PARAMETERS: MigrationParameters = {
	modelType: "application",
	migrationSteps: MIGRATION_STEPS,
	minimumSupportedVersion: "5.0.0",
	deprecationMessage:
		"Please use the App Model Migration Tools from 14.0.0 to migrate the models first"
};
