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
