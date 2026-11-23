// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

type AnyObject = Record<string, unknown>;

export function getByPath(val: AnyObject, [first, ...rest]: string[]): unknown {
	return first && val ? getByPath(val[first] as AnyObject, rest) : val;
}

// obj will be mutated
export function setByPath(obj: AnyObject, [first, ...rest]: string[], value: unknown): void {
	return rest.length > 0
		? setByPath((obj[first] ??= {}) as AnyObject, rest, value)
		: void (obj[first] = value);
}
