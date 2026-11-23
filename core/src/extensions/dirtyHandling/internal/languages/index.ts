// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { LocalizationTreeMap } from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/LocalizationTree.js";

import { de_DE } from "./de_DE.js";
import { en_US } from "./en_US.js";

export * from "./keys.js";

/**
 * @internal
 */
export const DEFAULT_TRANSLATIONS: LocalizationTreeMap = { en: en_US, de: de_DE };
