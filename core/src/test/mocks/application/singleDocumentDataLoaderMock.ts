// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Activity } from "../../../core/activity/index.js";
import type { DataLoader } from "../../../core/data/index.js";

export interface SingleDocumentData {
	readonly document: Activity.Data.Document;
}

export class SingleDocumentDataLoaderMock implements DataLoader<SingleDocumentData> {
	readonly name: string = "PlatformServerDocumentLoader";

	load(): Promise<SingleDocumentData> {
		return Promise.resolve({
			document: {
				id: "foo",
				modelId: "bar",
				RootGroup: {}
			}
		});
	}

	save(): Promise<SingleDocumentData> {
		return Promise.resolve({
			document: {
				id: "foo",
				modelId: "bar",
				RootGroup: {}
			}
		});
	}

	delete(): Promise<void> {
		return Promise.resolve();
	}

	canHandle(activityDescriptor: Activity.Descriptor): boolean {
		return !activityDescriptor.instance;
	}
}

export const singleDocumentDataLoaderMock = new SingleDocumentDataLoaderMock();
