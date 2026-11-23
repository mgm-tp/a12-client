// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Activity } from "@com.mgmtp.a12.client/client-core";

/**
 * Mock document factory for MobileNavigation models
 */
export function mobileNavigationDocument(i: number): Activity.Data.Document {
	const result = {
		id: `MobileNavigation-document/${i}`,
		modelId: "MobileNavigation-document",
		root: {
			DummyField: `Field${i}.1`
		}
	};
	return result;
}
