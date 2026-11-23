// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
