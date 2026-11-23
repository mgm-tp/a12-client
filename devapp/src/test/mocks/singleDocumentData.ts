// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { DataLoader } from "@com.mgmtp.a12.client/client-core";
import { Activity } from "@com.mgmtp.a12.client/client-core";

import { isRecord } from "../../devapp/utils/types.js";

export interface SingleDocumentData {
	readonly document: Activity.Data.Document;
}

export namespace SingleDocumentData {
	export function isInstance(data: unknown): data is SingleDocumentData {
		return isRecord(data) && Activity.Data.Document.isInstance(data.document);
	}
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
