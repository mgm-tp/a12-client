// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ModelPath } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type { FieldInstanceValue } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import type { ReadonlyObjectMap } from "../readonlyObjectMap.js";

/**
 * Configuration to define when a dm element should be considered as
 * non-relevant.
 * This configuration provides the ability to have more complex conditions
 * for the relevance of an element.
 */
export type NotRelevantConfig = ReadonlyObjectMap<NotRelevantConfigEntry>;

export interface NotRelevantConfigEntry {
	/** Whether the result of the case evaluation should be negated. */
	readonly negate?: true;

	/**
	 * Cases of the not-relevant dependency.
	 * The evaluation will return true if at least one case applies.
	 */
	readonly cases: NotRelevantCase[];
}

export interface NotRelevantCase {
	/**
	 * List of conditions for this case.
	 * The case applies if all conditions in this list are met.
	 */
	readonly conditions: FieldCondition[];
}

export interface FieldCondition {
	readonly fieldPath: ModelPath;

	readonly value: FieldInstanceValue;
}
