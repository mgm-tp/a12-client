// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Activity } from "../../../core/activity/index.js";

export function createSavingFailedError(content: object): Activity.Error.Saving {
	return {
		errorCode: "SAVING_FAILED_ERROR",
		content
	};
}

export function createInternalClientError(
	message = "Mock Internal client error"
): Activity.Error.InternalClient {
	return {
		errorCode: "INTERNAL_CLIENT_ERROR",
		message
	};
}
