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
 * 1. Open-Source License – EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

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
