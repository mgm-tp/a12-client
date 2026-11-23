// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type {
	EntityInstancePath,
	Message
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { DocumentPath } from "../../core/api/path/documentPath.js";

/**
 *  Filters the given messages by field reference using the referenced fields property of {@link Message}
 *
 * @param messages the unfiltered messages
 * @param fieldReference the field reference to filter with
 * @returns all messages from the given messages that reference the given field
 */
export function validationMessagesForFieldReference(
	messages: Message[],
	fieldReference: EntityInstancePath
): Message[] {
	return messages.filter(msg =>
		msg.referencedFields.some(refField => DocumentPath.equal(refField, fieldReference))
	);
}
