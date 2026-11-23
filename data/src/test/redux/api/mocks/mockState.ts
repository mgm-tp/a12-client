// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Activity } from "@com.mgmtp.a12.client/client-core";

import { initializeDataComponent } from "../../../../core/api/initializeDataComponent.js";
import type { DgDocument } from "../../../../internal/documentGraph.js";

export function setupStateWithDocuments(documents: DgDocument[]): object {
	const descriptor: Activity.Descriptor = {
		instance: "test/1",
		model: "test-descriptor-model"
	};

	const entryPoint = documents.length ? documents[0].docRef : undefined;

	return {
		activities: {
			["test-activity"]: {
				activationTimestamp: 0,
				dataHolders: [
					{
						descriptor,
						loadingState: "loaded",
						savingState: "not_saved",
						dirty: false,
						slices: {},
						data: documents.length ? initializeDataComponent(documents, [], entryPoint) : {}
					}
				],
				descriptor,
				id: "test-activity"
			} as Activity
		}
	};
}
