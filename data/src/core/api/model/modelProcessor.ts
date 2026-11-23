// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ModelProcessor } from "@com.mgmtp.a12.client/client-core";
import { Model as ModelAPI } from "@com.mgmtp.a12.client/client-core";

import { FormModel } from "./form-model.js";
import { defaultValueParser, unmarshallFormModel } from "./unmarshallFormModel.js";

export const formModelProcessor: ModelProcessor = {
	modelType: "form",
	processModel(loadedModel, referencedModels) {
		const dmRef = loadedModel.header.modelReferences?.[0].reference;
		const dm = referencedModels[dmRef ?? ""];
		if (FormModel.isInstance(loadedModel) && ModelAPI.isDocumentAndValidationModel(dm)) {
			return unmarshallFormModel(loadedModel, dm, defaultValueParser(dm));
		}

		return {
			type: "POST_PROCESSING_FAILED",
			message: `Post processing for model "${loadedModel.header.id}" failed.`,
			source: new Error("Cannot unmarshall 'form' model: " + loadedModel.header.id)
		};
	}
};
