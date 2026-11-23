// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type {
	EntityInstancePath,
	Message
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import { DocumentPath } from "../../core/api/path/documentPath.js";

import { KernelMessage } from "./message.js";

/**
 * Filters the given messages by data context using all referenced fields of
 * the {@link Message}.
 *
 * @param messages the unfiltered messages
 * @param dataContext the data context to filter with
 * @returns all messages from the given messages that belong to the given data context
 */
export function messagesForDataContext(
	messages: Message[],
	dataContext: EntityInstancePath
): Message[] {
	const dataContextString = DocumentPath.toString(dataContext);

	return messages.filter(msg => {
		const refFieldPathStrings = KernelMessage.effectiveFieldReferences(msg).map(
			DocumentPath.toString
		);
		return refFieldPathStrings.some(path => path.startsWith(dataContextString));
	});
}
