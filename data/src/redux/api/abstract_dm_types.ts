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
