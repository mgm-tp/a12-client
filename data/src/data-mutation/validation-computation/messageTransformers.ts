// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Message } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

export type MessageTransformer = (message: Message) => Message;

export const MessageTransformers = (() => {
	const transformers: MessageTransformer[] = [];

	return {
		add(transformer: MessageTransformer) {
			transformers.push(transformer);
		},
		transform(message: Message): Message {
			return transformers.reduce((acc, fn) => fn(acc), message);
		}
	};
})();
