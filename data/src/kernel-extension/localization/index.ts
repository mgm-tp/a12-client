// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type {
	Localizable,
	LocalizableArgs
} from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";
import {
	localizableFromLocalizationTreeMap,
	type LocalizationTreeMap
} from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";

import { de } from "./de.js";
import { en } from "./en.js";

export { RESOURCE_KEYS } from "./keys.js";

/* @internal */
export const DEFAULT_TRANSLATIONS: LocalizationTreeMap = { en, de };

/* @internal */
export function createResourceLocalizable(key: string, values: LocalizableArgs = {}): Localizable {
	return localizableFromLocalizationTreeMap(key, DEFAULT_TRANSLATIONS, values);
}
