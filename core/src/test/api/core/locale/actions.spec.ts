// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepStrictEqual } from "node:assert/strict";

import type { Action } from "typescript-fsa";

import type { Locale } from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";

import { LocaleActions } from "../../../../core/locale/index.js";
import { US_LOCALE } from "../../../utils/localization.js";

describe("core.locale.actions", () => {
	describe("LocaleActions", () => {
		it("creates set locale action", () => {
			const expectedAction: Action<Locale> = {
				type: LocaleActions.set.type,
				payload: US_LOCALE
			};

			deepStrictEqual(LocaleActions.set(US_LOCALE), expectedAction);
		});
	});
});
