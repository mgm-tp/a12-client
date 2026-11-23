// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { initializeKeys } from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/LocalizationTree.js";

/**
 * Resource keys for usage with the A12 localization API.
 *
 * Please note that adding new keys to this object is not considered as a breaking change.
 */
export const RESOURCE_KEYS = {
	frame: {
		mainMenu: {
			smallDevice: {
				/** Key of the button title to close the main menu on small device */
				closeMenuButtonTitle: "",
				/** Key of the button title to open the main menu on small device */
				openMenuButtonTitle: ""
			}
		}
	}
};

initializeKeys(RESOURCE_KEYS);
