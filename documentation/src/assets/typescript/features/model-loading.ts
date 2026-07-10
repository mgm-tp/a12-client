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
import { isModelInstance } from "@com.mgmtp.a12.base/base-model-api";
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
	protected basePath: string;

	constructor(basePath: string = "/") {
		this.basePath = basePath;
	}

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
