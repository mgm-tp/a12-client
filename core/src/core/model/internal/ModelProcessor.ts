// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Model as ModelAPI } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import { DocumentServiceFactory } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/facade.js";

import { assertCondition } from "../../assertion.js";

import { Model } from "./Model.js";
import type { ModelMap } from "./ModelState.js";

const documentModelMarshaller = new DocumentServiceFactory().getDocumentModelSerializer();

/**
 * Allows custom post-processing of models for the `ModelLoader` API
 */
export interface ModelProcessor {
	/**
	 * The type of model this processor can handle
	 */
	readonly modelType: string;
	/**
	 * How to process the model
	 *
	 * @param loadedModel The loaded model, also contains validation code for document models
	 * @param referencedModels All referenced models from the header
	 * @returns A post-processed model or an error
	 */
	processModel(loadedModel: ModelAPI, referencedModels: ModelMap): ModelAPI | Model.Error;
}

/**
 * The default processor for document models
 *
 * Provided for convenience when customizing the `ModelLoader` API.
 */
export const documentModelProcessor: ModelProcessor = {
	modelType: "document",
	processModel(model) {
		try {
			assertCondition(Model.isDocumentAndValidationModel(model));

			const { generatedCodeAccessor, ...actualModel } = model;

			const documentModel = documentModelMarshaller.deserialize(JSON.stringify(actualModel));

			// Check if the GeneratedCodeAccessor returned a valid result
			const metaModel = generatedCodeAccessor.getMetaModel();
			if (metaModel === undefined) {
				return createPostProcessingFailedError(
					{ name: model.header.id, modelType: "document" },
					new Error("GeneratedCodeAccessor returned undefined")
				);
			}

			return { ...documentModel, generatedCodeAccessor };
		} catch (error) {
			return createPostProcessingFailedError(
				{ name: model.header.id, modelType: "document" },
				error
			);
		}
	}
};

/** @internal */
export function createPostProcessingFailedError(
	{ name }: Model.Descriptor,
	error?: unknown
): Model.Error {
	return {
		type: "POST_PROCESSING_FAILED",
		message: `Post processing for model "${name}" failed.`,
		source: error
	};
}
