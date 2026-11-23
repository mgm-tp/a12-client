// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com
import type {
	EntityInstancePath,
	Message
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { KernelMessage } from "../../../../data-mutation/validation-computation/message.js";

export function message(options: {
	type: "parseError" | "ruleError";
	entityInstance: EntityInstancePath;
}): Message {
	const { type, entityInstance } = options;

	return {
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
