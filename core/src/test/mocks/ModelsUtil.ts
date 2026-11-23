// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { ModelReference } from "@com.mgmtp.a12.base/base-model-api/lib/main/header/index.js";
import type { Model as ModelAPI } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import { isModelInstance } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type {
	DocumentModel,
	IGeneratedCodeAccessor
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";
import {
	DocumentServiceFactory,
	GeneratedCodeAccessorFactory
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/facade.js";

import type { Model } from "../../core/model/index.js";
import type { ModelMap } from "../../core/model/internal/ModelState.js";
import { isRecord } from "../../core/utils.js";

export function modelListToMap(models: ModelAPI[]): ModelMap {
	return models.reduce((modelMap, model) => {
		return { ...modelMap, [model.header.id]: model };
	}, {});
}

export function readModelFile(modelName: string): string {
	return readFileSync(
		join(import.meta.dirname, "..", "..", "..", "target", "models", modelName),
		"utf8"
	);
}

export function readModel(modelName: string): ModelAPI | Model.Error {
	try {
		const model = JSON.parse(readModelFile(`${modelName}.json`));

		return isModelInstance(model)
			? model
			: { type: "UNKNOWN", message: `Model "${modelName}" does not fullfil the model API!` };
	} catch (error) {
		return {
			type: "UNKNOWN",
			message: isRecord(error) ? (error.message as string) : `Loading ${modelName} failed!`
		};
	}
}

export function readDocumentAndValidationModel(
	modelName: string
): Model.DocumentAndValidationModel | Model.Error {
	try {
		return createDocumentAndValidationModel(
			new DocumentServiceFactory()
				.getDocumentModelSerializer()
				.deserialize(JSON.stringify(readModel(modelName))),
			new GeneratedCodeAccessorFactory().createScriptAccessor(
				readModelFile(`${modelName}.validation.js`)
			)
		);
	} catch (error) {
		return {
			type: "UNKNOWN",
			message: isRecord(error) ? (error.message as string) : `Loading ${modelName} failed!`
		};
	}
}

function createDocumentAndValidationModel(
	documentModel: DocumentModel,
	generatedCodeAccessor: IGeneratedCodeAccessor
): Model.DocumentAndValidationModel {
	return { ...documentModel, generatedCodeAccessor };
}

export function isOverviewModel(model: ModelAPI): model is ModelAPI {
	return model.header.modelType === "overview";
}

export function isFormModel(model: ModelAPI): model is ModelAPI {
	return model.header.modelType === "form";
}

export function createDummyModel(
	id = "anyId",
	modelType = "anyType",
	modelReferences?: ModelReference[],
	modelVersion = "1.0.0"
): ModelAPI {
	return {
		header: { id, modelType, modelVersion, modelReferences, annotations: [] },
		content: {}
	};
}
