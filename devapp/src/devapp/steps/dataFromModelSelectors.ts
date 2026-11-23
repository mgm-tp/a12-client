// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

export namespace Extractors {
	export function extractFieldValue(
		nameOfField: string,
		rootName: string
	): (data: { [key: string]: {} }) => object | undefined | null {
		return data => {
			const root: { [key: string]: {} } | undefined = data[rootName];

			if (root === undefined) {
				return null;
			}

			return root[nameOfField] || null;
		};
	}

	export function extractId(data: { [key: string]: {} }): object | undefined {
		return data["id"];
	}
}
