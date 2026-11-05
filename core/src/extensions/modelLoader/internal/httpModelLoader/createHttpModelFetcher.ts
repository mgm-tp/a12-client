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

import type { Model as ModelAPI } from "@com.mgmtp.a12.base/base-model-api";
import type { DocumentModel } from "@com.mgmtp.a12.kernel/kernel-md-facade";
import { GeneratedCodeAccessorFactory } from "@com.mgmtp.a12.kernel/kernel-md-facade";

import type { Model } from "../../../../core/model/index.js";

import { createNotFoundError } from "../createError.js";
import type { ModelFetcher, ModelFetcherResult } from "../ModelFetcher.js";

const codeFactory = new GeneratedCodeAccessorFactory();

/**
 * Factory function that returns a {@link ModelFetcher} that returns a list of {@link ModelFetcherResult}.
 */
export function createHttpModelFetcher(basePath = "/"): ModelFetcher {
	const convertToFetchResult = createConverter(basePath);

	return async descriptors => {
		const fetchResultPromises = descriptors.map(convertToFetchResult);

		const fetchResults = await Promise.allSettled(fetchResultPromises);

		// TS is not smart enough (yet) to narrow result on its own
		return fetchResults.filter(isFulfilledResult).map(r => r.value);
	};
}

/**
 * Creates a converter that turns a {@link Model.Descriptor} into a promise
 * that resolves with a server response or an error.
 *
 * #### Notes
 *
 * - document models will trigger two fetch requests (model + validation code)
 * - returned promise will never reject, any errors are caught and wrapped
 */
function createConverter(
	basePath: string
): (descriptor: Model.Descriptor) => Promise<ModelFetcherResult> {
	return descriptor => {
		const baseName = `${basePath}${descriptor.name}`;

		const requestPromise =
			descriptor.modelType === "document"
				? Promise.all([
						fetch(`${baseName}.json`).then(response => response.json() as Promise<DocumentModel>),
						fetch(`${baseName}.validation.js`).then(response => response.text())
					]).then(([model, script]) => ({
						...model,
						generatedCodeAccessor: codeFactory.createScriptAccessor(script)
					}))
				: fetch(`${baseName}.json`).then(response => response.json() as Promise<ModelAPI>);

		return requestPromise
			.catch(e => createNotFoundError(descriptor, e))
			.then(result => ({ modelId: descriptor.name, result }));
	};
}

function isFulfilledResult<T>(
	result: PromiseSettledResult<T>
): result is PromiseFulfilledResult<T> {
	return result.status === "fulfilled";
}
