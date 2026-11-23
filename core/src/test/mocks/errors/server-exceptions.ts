// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JsonRpc2ResponseError } from "@com.mgmtp.a12.dataservices/dataservices-access/lib/json-rpc/index.js";

export function createJsonRpc2ResponseError(
	level: "ERROR" | "WARNING" | "INFO",
	text = "test"
): JsonRpc2ResponseError {
	return {
		jsonrpc: "2.0",
		id: "any",
		error: {
			code: 666,
			message: "any message",
			data: {
				level,
				title: { key: `title-${text}`, default: text },
				description: { key: `description-${text}`, default: text },
				details: undefined!
			}
		}
	};
}
