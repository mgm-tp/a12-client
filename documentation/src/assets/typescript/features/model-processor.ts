// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Model as ModelAPI } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type { Model, ModelMap } from "@com.mgmtp.a12.client/client-core";

// tag::api[]
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
// end::api[]

// tag::example[]
export const customModelProcessor: ModelProcessor = {
	modelType: "overview",
	processModel(model, referencedModels) {
		// any custom logic for a loaded overview model

		// for example, accessing and checking the referenced document model
		const documentModelRef = model.header.modelReferences?.find(
			ref => ref.modelType === "document"
		);
		const documentModel = referencedModels[documentModelRef?.reference ?? ""];
		if (!documentModel) {
			return {
				type: "POST_PROCESSING_FAILED",
				message: "Document model not found"
			};
		}

		// in any case, return either the processed model OR an error describing why/how the processing failed
		return model;
	}
};
// end::example[]
