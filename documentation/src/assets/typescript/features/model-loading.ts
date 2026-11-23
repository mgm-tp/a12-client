// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Model as ModelAPI } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import { isModelInstance } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type { Model, ModelMap } from "@com.mgmtp.a12.client/client-core";

// tag::Interface[]
export interface ModelLoader {
	/**
	 * A unique name to identify the loader
	 */
	readonly name: string;

	/**
	 * Loads an A12 model together with all of its referenced models.
	 *
	 * @param modelDescriptors List of model descriptors to load
	 * @param existingModels Map of already existing models, useful if post processing
	 * needs access to models that were not loaded
	 */
	load(modelDescriptors: Model.Descriptor[], existingModels: ModelMap): Promise<ModelMap>;
}
// end::Interface[]

// tag::CustomModelLoader[]
export class CustomModelLoader implements ModelLoader {
	readonly name: string = "CustomModelLoader";

	constructor(protected basePath: string = "/") {}

	private async loadSingleModel(
		descriptor: Model.Descriptor
	): Promise<{ name: string; result: ModelAPI | Model.Error }> {
		try {
			const response = await fetch(`${this.basePath}${descriptor.name}.json`);
			const jsonContent = await response.json();

			if (!isModelInstance(jsonContent)) {
				throw new Error("not a valid model");
			}

			return { name: descriptor.name, result: jsonContent };
		} catch (error) {
			return {
				name: descriptor.name,
				result: { type: "MY_MODEL_ERROR", source: error }
			};
		}
	}

	async load(descriptors: Model.Descriptor[]): Promise<ModelMap> {
		// load models in parallel
		const results = await Promise.all(
			descriptors.map(descriptor => this.loadSingleModel(descriptor))
		);

		// apply post processing if needed
		return results.reduce((modelMap, { name, result }) => {
			return { ...modelMap, [name]: result };
		}, {} as ModelMap);
	}
}
// end::CustomModelLoader[]
