// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { EntityInstancePath } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import type { ValidationData } from "../types.js";

export type ValidationType = "field" | "partial" | "full" | (string & {});

export interface ValidationConfig {
	getValidationScope: (
		defaultScope: EntityInstancePath[],
		type: ValidationType
	) => EntityInstancePath[];
	filterValidationResult: (
		previousValidationData: ValidationData,
		nextValidationData: ValidationData,
		type: ValidationType,
		relevantInstances?: EntityInstancePath[]
	) => ValidationData;
}

let __instance: ValidationConfig = {
	getValidationScope: defaultScope => defaultScope,
	filterValidationResult: (_previousValidationData, nextValidationData) => nextValidationData
};

export namespace ValidationConfig {
	export function set(newInstance: ValidationConfig) {
		__instance = newInstance;
	}

	export function get() {
		return __instance;
	}
}
