// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

export type DataReference = string; // kind of pointless except for a better lookup of usages in code

export namespace DataReference {
	export function resolveWithIndex(
		dataRef: DataReference,
		elementName: string,
		index: number
	): DataReference {
		return `${dataRef}/${elementName}[${index}]`;
	}

	export function resolve(dataRef: DataReference, elementName: string): DataReference {
		return `${dataRef}/${elementName}`;
	}
}
