// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { initializeKeys } from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";

/** Data component resource keys for localization */
export const RESOURCE_KEYS = {
	/** Key of the text used for boolean value true */
	true: "",
	/** Key of the text used for boolean value false */
	false: "",
	/** Key of the text used for value null */
	null: "",
	textOutput: {
		/** Key of the 'no data' text which is shown when no data is available for a TextOutput */
		noData: ""
	}
};

initializeKeys(RESOURCE_KEYS);
