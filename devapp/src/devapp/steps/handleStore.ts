// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { Activity } from "@com.mgmtp.a12.client/client-core";

import { DocumentListData } from "../mocks/SimpleOverview/data.js";

/**
 * Gets a document from one activity based on its index in the overview table
 */
export function getIdOfDocument(activity: Activity, instanceIdx: number): string | undefined {
	const data = Activity.findDefaultDataHolder(activity)?.data;
	if (!DocumentListData.isInstance(data)) {
		return undefined;
	}

	const document = data.documents[instanceIdx];
	if (document === undefined) {
		return undefined;
	} else {
		return String(document.id);
	}
}
