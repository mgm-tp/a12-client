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

import type { Model as ModelAPI, ModelReference } from "@com.mgmtp.a12.base/base-model-api";

import type {
	ModelLoader,
	ModelMap,
	ModelProcessor,
	SupportedModelVersions
} from "../../../core/model/index.js";
import { Model, documentModelProcessor } from "../../../core/model/index.js";

import type { ModelFetcher, ModelFetcherResult } from "./ModelFetcher.js";

/** @internal */
export class GenericModelLoader implements ModelLoader {
	readonly name: string = "GenericModelLoader";

	constructor(
		protected readonly modelFetcher: ModelFetcher,
		private readonly modelProcessors?: ModelProcessor[],
		public readonly supportedModelVersions?: SupportedModelVersions
	) {}

	async load(descriptors: Model.Descriptor[], existingModels: ModelMap): Promise<ModelMap> {
		const fetchResults = await this.modelFetcher(descriptors);

		// when processing a ui model, the referenced document model needs to be processed already
		// to ensure this is always the case, document model results are sorted to the top of the list
		return fetchResults
			.sort(r => (Model.isDocumentAndValidationModel(r.result) ? -1 : 1))
			.reduce((modelMap, { modelId, result }) => {
				return {
					...modelMap,
					[modelId]: this.processResult(result, { ...existingModels, ...modelMap })
				};
			}, {} as ModelMap);
	}

	processResult(
		result: ModelFetcherResult["result"],
		existingModels: ModelMap
	): ModelAPI | Model.Error {
		if (Model.Error.isInstance(result)) {
			return result;
		}

		const { modelType, modelReferences } = result.header;

		// processors are only allowed to access referenced models
		const referencedModels = extractReferences(existingModels, modelReferences);

		// use custom processor first when available
		const customModelProcessor = this.modelProcessors?.find(mp => mp.modelType === modelType);

		// for DMs, fallback to the default processor to ensure they are processed
		return Model.isDocumentAndValidationModel(result)
			? (customModelProcessor ?? documentModelProcessor).processModel(result, referencedModels)
			: (customModelProcessor?.processModel(result, referencedModels) ?? result);
	}
}

/**
 * Turns a given list of `modelReferences` into a `ModelMap` by looking them up in `existingModels`.
 *
 * All references are guaranteed to exist, since they were either just loaded or already existed before.
 */
function extractReferences(
	existingModels: ModelMap,
	modelReferences?: readonly ModelReference[]
): ModelMap {
	return (
		modelReferences?.reduce((modelMap, ref) => {
			return {
				...modelMap,
				[ref.reference]: existingModels[ref.reference]
			};
		}, {}) ?? {}
	);
}
