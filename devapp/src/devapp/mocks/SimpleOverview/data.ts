// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { Activity } from "@com.mgmtp.a12.client/client-core";

import { isRecord } from "../../utils/types.js";

export interface DocumentListData {
	readonly documents: Activity.Data.Document[];
	readonly totalDocumentsCount: number | undefined;
}

export namespace DocumentListData {
	export function isInstance(data: unknown): data is DocumentListData {
		return (
			isRecord(data) &&
			Array.isArray(data.documents) &&
			data.documents.every(Activity.Data.Document.isInstance)
		);
	}
}
