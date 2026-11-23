// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Model, ModelLoader, ModelMap } from "@com.mgmtp.a12.client/client-core";

import { readDocumentAndValidationModel, readModel } from "./ModelsUtil.js";

class NewFileSystemModelLoader implements ModelLoader {
	readonly name: string = "NewFileSystemModelLoader";

	async load(descriptors: Model.Descriptor[]): Promise<ModelMap> {
		return descriptors.reduce((modelMap, { name, modelType }) => {
			return {
				...modelMap,
				[name]: modelType === "document" ? readDocumentAndValidationModel(name) : readModel(name)
			};
		}, {});
	}
}

export const newFileSystemModelLoader = new NewFileSystemModelLoader();
