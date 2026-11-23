// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

/**
 * Prefer to use these string aliases for self-documentation of the usage
 */
export type DocRef = string;
export type LinkId = string;
export type ElementRef = DocRef | LinkId;

// TODO: Improvement: change to array string[]:
// 		Example: "CoInsurer/businessPartner" => ["CoInsurer", "businessPartner"]export type RelshPath = string;
export type RelshPath = string;

export type DeepReadonly<T> = { readonly [P in keyof T]: DeepReadonly<T[P]> };

// Note: DocRef and Id are the same on the client!!!!!
// "Contract/24" is both. "24" is never extracted on used on its own
// export function docRefToId(sourceDocRef: string) {
// 	return sourceDocRef;
// }
