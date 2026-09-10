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

import { ModelPath } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type {
	EntityInstancePath,
	FieldInstanceValue
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { getDocumentPath } from "../../path/documentPath.js";

import type { NotRelevantConfig, NotRelevantConfigEntry } from "./notRelevantConfig.js";

/* FIXME: should be internal, but is used in uiflows */
export namespace ElementStateUtil {
	/* FIXME: should be internal, but is used in uiflows */
	/**
	 * evaluate whether a field is not relevant
	 */
	export function isFieldNotRelevant(
		fieldPath: EntityInstancePath,
		getValue: (path: EntityInstancePath) => FieldInstanceValue | undefined,
		configs?: NotRelevantConfig[]
	): boolean {
		if (!configs?.length) {
			return false;
		}

		const fieldState = evaluateConfigs(fieldPath, getValue, configs);
		const groupState = isGroupNotRelevant(fieldPath, getValue, configs);

		return fieldState || groupState;
	}

	/**
	 * @internal
	 *
	 * evaluate whether a group is not relevant
	 */
	export function isGroupNotRelevant(
		path: EntityInstancePath,
		getValue: (path: EntityInstancePath) => FieldInstanceValue | undefined,
		configs?: NotRelevantConfig[]
	): boolean {
		if (!configs?.length) {
			return false;
		}

		let remainingPath = path;
		while (remainingPath.length > 0) {
			if (evaluateConfigs(remainingPath, getValue, configs)) {
				return true;
			}

			remainingPath = remainingPath.slice(0, remainingPath.length - 1);
		}

		return false;
	}

	function evaluateConfigs(
		elementPath: EntityInstancePath,
		getValue: (path: EntityInstancePath) => FieldInstanceValue | undefined,
		configs: NotRelevantConfig[]
	): boolean {
		return configs.some(config => {
			const configEntry = config?.[ModelPath.toString(elementPath)];
			return configEntry ? evaluateConfigEntry(configEntry, elementPath, getValue) : false;
		});
	}

	/**
	 * @internal
	 * Only exported for testing.
	 */
	export function evaluateConfigEntry(
		configEntry: NotRelevantConfigEntry,
		elementPath: EntityInstancePath,
		getValue: (path: EntityInstancePath) => FieldInstanceValue | undefined
	): boolean {
		const result = configEntry.cases.some(caze =>
			caze.conditions.every(condition => {
				const triggerFieldDocumentPath = getDocumentPath(condition.fieldPath, elementPath);
				const triggerValue = getValue(triggerFieldDocumentPath);

				// check if values are equal or if both values are falsy to treat
				// null, undefined and empty strings equally
				return (
					triggerValue === condition.value ||
					(isNullOrUndefined(triggerValue) && isNullOrUndefined(condition.value))
				);
			})
		);

		return configEntry?.negate ? !result : result;
	}

	function isNullOrUndefined(value: unknown): boolean {
		return value === null || value === undefined;
	}
}
