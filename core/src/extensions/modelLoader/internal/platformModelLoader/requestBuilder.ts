// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ModelJsonRpc2Request } from "@com.mgmtp.a12.dataservices/dataservices-access/lib/model/index.js";

let requestCounter = 0;

/** @internal */
export const RequestBuilder = {
	listModels(modelNames: string[]): ModelJsonRpc2Request.ListModelsJsonRpc2Request {
		return {
			jsonrpc: "2.0",
			id: `listModels-${requestCounter++}`,
			method: "LIST_MODELS_INTERNAL",
			params: { modelNames }
		};
	},

	listValidationCodes(
		documentModelNames: string[]
	): ModelJsonRpc2Request.ListValidationsJsonRpc2Request {
		return {
			jsonrpc: "2.0",
			id: `listCodes-${requestCounter++}`,
			method: "LIST_DOCUMENT_VALIDATION_CODES_INTERNAL",
			params: {
				documentModelNames
			}
		};
	}
};
