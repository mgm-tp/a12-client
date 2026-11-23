// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Activity, DataLoader } from "@com.mgmtp.a12.client/client-core";

import type { CustomData } from "./customDocumentDataLoader.js";

class CustomOverviewDataLoader implements DataLoader<CustomData> {
	public name = "CustomOverviewDataLoader";

	load(): Promise<CustomData> {
		const result = {
			myCustomData: "Some custom data"
		};
		return Promise.resolve(result);
	}
	save(): Promise<CustomData> {
		throw new Error("Method not implemented.");
	}

	delete(): Promise<void> {
		throw new Error("Method not implemented.");
	}

	canHandle(ad: Activity.Descriptor): boolean {
		return ad.feature === "DataLoaderWithoutModel" && !ad.instance;
	}
}

export const customOverviewDataLoader = new CustomOverviewDataLoader();
