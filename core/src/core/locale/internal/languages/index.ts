// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { LocalizationTreeMap } from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/LocalizationTree.js";

import { de } from "./de.js";
import { en } from "./en.js";
import type { RESOURCE_KEYS } from "./keys.js";

export * from "./keys.js";

export const DEFAULT_TRANSLATIONS: DefaultTranslations = { en, de };

interface DefaultTranslations extends LocalizationTreeMap {
	en: typeof RESOURCE_KEYS;
	de: typeof RESOURCE_KEYS;
}
