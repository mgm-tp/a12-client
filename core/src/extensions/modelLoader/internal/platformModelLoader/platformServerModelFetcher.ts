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

import { Dispatcher, JsonRpc2Response } from "@com.mgmtp.a12.dataservices/dataservices-access";
import { GeneratedCodeAccessorFactory } from "@com.mgmtp.a12.kernel/kernel-md-facade";

import { Model } from "../../../../core/model/index.js";

import type { ModelFetcher } from "../ModelFetcher.js";
import { createNotFoundError } from "../createError.js";

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
