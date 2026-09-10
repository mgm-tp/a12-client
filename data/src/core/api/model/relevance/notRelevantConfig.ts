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
 * 1. Open-Source License - EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED "AS IS" AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

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
