// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { Model as ModelAPI } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import { isModelInstance } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type { Model } from "@com.mgmtp.a12.client/client-core";
import type {
	DocumentModel,
	IGeneratedCodeAccessor
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";
import {
	DocumentServiceFactory,
	GeneratedCodeAccessorFactory
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/facade.js";

function readModelFile(modelName: string): string {
	return readFileSync(
		join(import.meta.dirname, "..", "..", "..", "target", "models", modelName),
		"utf8"
	);
}

export function readModel(modelName: string): ModelAPI {
	const model = JSON.parse(readModelFile(`${modelName}.json`));

	if (!isModelInstance(model)) {
		throw new Error(`Model "${modelName}" does not fullfil the model API!`);
	}

	return model;
}

export function readDocumentAndValidationModel(
	modelName: string
): Model.DocumentAndValidationModel {
	return createDocumentAndValidationModel(
		new DocumentServiceFactory()
			.getDocumentModelSerializer()
			.deserialize(JSON.stringify(readModel(modelName))),
		new GeneratedCodeAccessorFactory().createScriptAccessor(
			readModelFile(`${modelName}.validation.js`)
		)
	);
}

function createDocumentAndValidationModel(
	documentModel: DocumentModel,
	generatedCodeAccessor: IGeneratedCodeAccessor
): Model.DocumentAndValidationModel {
	return { ...documentModel, generatedCodeAccessor };
}
