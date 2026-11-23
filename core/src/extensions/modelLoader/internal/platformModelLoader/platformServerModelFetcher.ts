// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { Dispatcher } from "@com.mgmtp.a12.dataservices/dataservices-access/lib/dispatch/index.js";
import { JsonRpc2Response } from "@com.mgmtp.a12.dataservices/dataservices-access/lib/json-rpc/index.js";
import { GeneratedCodeAccessorFactory } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/facade.js";

import { Model } from "../../../../core/model/index.js";

import { createNotFoundError } from "../createError.js";
import type { ModelFetcher } from "../ModelFetcher.js";

import { RequestBuilder } from "./requestBuilder.js";

const codeFactory = new GeneratedCodeAccessorFactory();

/** @internal */
export const platformServerModelFetcher: ModelFetcher = async descriptors => {
	const modelNames = descriptors.map(d => d.name);
	const dmNames = descriptors.filter(d => d.modelType === "document").map(d => d.name);

	try {
		const [modelsResponse, codesResponse] = await Dispatcher.rpc("en", [
			RequestBuilder.listModels(modelNames),
			dmNames.length > 0 ? RequestBuilder.listValidationCodes(dmNames) : undefined
		]);

		const codesMap = codesResponse?.result.documentValidationCodes ?? {};

		return descriptors.map(d => {
			const modelId = d.name;

			// when the user had no permission for a model, the response will not include it (while still being successful)
			const model = modelsResponse.result.models[modelId];

			return {
				modelId,
				result: model
					? Model.isDocumentModel(model)
						? {
								...model,
								generatedCodeAccessor: codeFactory.createScriptAccessor(codesMap[modelId])
							}
						: model
					: createNotFoundError(d)
			};
		});
	} catch (error) {
		const err = unwrapRPCError(error);

		return descriptors.map(d => ({ modelId: d.name, result: createNotFoundError(d, err) }));
	}
};

/**
 * Attempts to produce a more readable error in case the original error came from the RPC operations.
 *
 * Notes:
 * - only consider the first error response, since all others will just refer to the first one
 * - further extraction from data is not possible because services errors do not guarantee any typing
 */
function unwrapRPCError(error: unknown): unknown {
	return Array.isArray(error) && error.every(JsonRpc2Response.error.isInstance)
		? error[0].error.data
		: error;
}
