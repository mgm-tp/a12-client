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

import type { DocumentModel } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { isRecord } from "../typeguards.js";

type FieldValue = string;
type MultiSelectValue = { readonly [fieldName: string]: FieldValue };

export type MultiSelectData = readonly MultiSelectValue[];

/**
 * @internal
 */
export function isMultiSelect(dmElement?: DocumentModel.Element): dmElement is DocumentModel.Group {
	return dmElement?.type === "Group" && dmElement.usageType === "multi-select";
}

function isMultiSelectValue(element: unknown): element is MultiSelectValue {
	if (!isRecord(element)) {
		return false;
	}

	const values = Object.values(element);

	return values.length === 1 && typeof values[0] === "string";
}

export function isMultiSelectData(value: unknown): value is MultiSelectData {
	return Array.isArray(value) && value.every(isMultiSelectValue);
}

export function isMultiSelectDataEqual(left: MultiSelectData, right: MultiSelectData): boolean {
	return (
		left.length === right.length &&
		left.every((e, idx) => Object.entries(e).every(([key, value]) => value === right[idx][key]))
	);
}

export function getMultiSelectValueField(
	element: DocumentModel.Element
): DocumentModel.Field | undefined {
	return element.type === "Group" &&
		element.usageType === "multi-select" &&
		element.elements[0].type === "Field"
		? element.elements[0]
		: undefined;
}
