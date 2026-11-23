// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Activity } from "@com.mgmtp.a12.client/client-core";

/**
 * Mock document factory for activity replacement models
 */
export function activityReplacementDocument(i: number): Activity.Data.Document {
	const result = {
		id: `ActivityReplacement-document/${i}`,
		modelId: "ActivityReplacement-document",
		root: {
			DummyField: `${i}`
		}
	};
	return result;
}
