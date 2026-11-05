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

import type { EntityInstancePath, Message } from "@com.mgmtp.a12.kernel/kernel-md-facade";

import { KernelMessage } from "../../../../data-mutation/validation-computation/message.js";

/**
 * Kernel 31.3 (A12K-4496) adds the required property `groupsOfPossiblyCausingEntities` to
 * `Message`. Spread these defaults into a message fixture so it satisfies that API while
 * still compiling against the released 31.1 one, where the property does not exist yet:
 * properties coming from a spread are not subject to the excess property check.
 * Inline the property and drop this once the catalog moves to a kernel that has it.
 */
export const messageDefaults = { groupsOfPossiblyCausingEntities: [] };

export function message(options: {
	type: "parseError" | "ruleError";
	entityInstance: EntityInstancePath;
}): Message {
	const { type, entityInstance } = options;

	return {
		...messageDefaults,
		entityInstance,
		errorCode: type === "parseError" ? "formalValidation" : "rule",
		errorText: [],
		messageType: "VALUE_ERROR",
		referencedFields: [entityInstance],
		refOmissionErrorResponsible: [],
		rulePath: type === "parseError" ? KernelMessage.FORMAL_VALIDATION : "/rule/path",
		severity: "ERROR"
	};
}
