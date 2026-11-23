// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ModelLoader, ModelMap } from "../../../core/model/index.js";

class ModelLoaderMock implements ModelLoader {
	readonly name: string = "PlatformServerModelLoader";

	load(): Promise<ModelMap> {
		return Promise.reject("Mocked");
	}
}
export const mockModelLoader = new ModelLoaderMock();
