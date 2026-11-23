// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

/**
 * @package
 *
 * Types to abstract Field + Group with usageType ["attachment", "multi-select"]
 * into "FieldLike".
 */

import type { DocumentModel } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

// TODO: internal? not used anywhere else
export const AbstractElementTypes = ["Group", "FieldLike"] as const;

// TODO: internal? not used anywhere else
export type AbstractElementType = (typeof AbstractElementTypes)[number];

// TODO: internal? not used anywhere else
/**
 * fields are field-like.
 *
 * attachment and multi-select groups are field-like.
 *
 * everything else is a group
 */
export function abstractTypeFromElement(e: DocumentModel.Element): AbstractElementType {
	const fromField = (e: DocumentModel.Element) => (e.type === "Field" ? "FieldLike" : undefined);

	const fromFieldLikeGroup = (e: DocumentModel.Element) =>
		e.type === "Group" &&
		e.usageType !== undefined &&
		["attachment", "multi-select"].includes(e.usageType)
			? "FieldLike"
			: undefined;

	return fromField(e) ?? fromFieldLikeGroup(e) ?? "Group";
}
