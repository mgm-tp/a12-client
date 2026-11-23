// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

// NOTE: this function is in a separate file to resolve cycles

import { ApplicationModel } from "../../model/internal/ApplicationModel.js";

import type { DynamicMatchCondition } from "./typings.js";

/** @internal */
export function convertMatchConditionsInScene(
	matchConditions: readonly ApplicationModel.MatchCondition[]
): DynamicMatchCondition {
	return descriptor =>
		matchConditions.every(matchCondition =>
			ApplicationModel.MatchCondition.evaluate(matchCondition, descriptor)
		);
}
