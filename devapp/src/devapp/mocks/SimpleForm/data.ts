// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { Activity } from "@com.mgmtp.a12.client/client-core";

import { isRecord } from "../../utils/types.js";

export interface SingleDocumentData {
	readonly document: Activity.Data.Document;
}

export namespace SingleDocumentData {
	export function isInstance(data: unknown): data is SingleDocumentData {
		return isRecord(data) && Activity.Data.Document.isInstance(data.document);
	}
}
