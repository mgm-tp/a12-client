// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type {
	EntityInstancePath,
	Message
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { DocumentPath } from "../../core/api/path/documentPath.js";

export namespace KernelMessage {
	export const FORMAL_VALIDATION = "formalePruefung";

	export function effectiveFieldReferences(message: Message): EntityInstancePath[] {
		return message.messageType === "OMISSION_ERROR"
			? message.refOmissionErrorResponsible
			: message.referencedFields;
	}

	export function isKnownFormalError(
		formallyIncorrectPaths: EntityInstancePath[],
		message: Message
	): boolean {
		return (
			message.rulePath === FORMAL_VALIDATION &&
			formallyIncorrectPaths.some(path => DocumentPath.equal(path, message.entityInstance))
		);
	}
}
