// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { strictEqual, deepStrictEqual } from "node:assert/strict";

import type { Action } from "typescript-fsa";

import { LocaleActions, LocaleReducers } from "../../../../core/locale/index.js";
import { DE_LOCALE, US_LOCALE } from "../../../utils/localization.js";

describe("core.locale.reducers", () => {
	describe("LocaleReducers", () => {
		const initialLocale = US_LOCALE;
		const emptyAction: Action<{}> = { type: "EmptyAction", payload: {} };

		describe("locale", () => {
			it("handles empty action by returning previous locale", () => {
				strictEqual(LocaleReducers.locale(initialLocale, emptyAction), initialLocale);
			});

			it("handles undefined previous state by using the Locale from the given action", () => {
				deepStrictEqual(LocaleReducers.locale(undefined, LocaleActions.set(DE_LOCALE)), DE_LOCALE);
			});

			it("handles empty action and undefined previous state by returning default locale", () => {
				const defaultLocale = initialLocale;
				deepStrictEqual(LocaleReducers.locale(undefined, emptyAction), defaultLocale);
			});

			it("handles set action", () => {
				deepStrictEqual(
					LocaleReducers.locale(initialLocale, LocaleActions.set(DE_LOCALE)),
					DE_LOCALE
				);
			});

			it("returns the old unchanged state if no update is needed", () => {
				const action = LocaleActions.set(DE_LOCALE);
				const stateAfterFirstCall = LocaleReducers.locale(initialLocale, action);
				const stateAfterSecondCall = LocaleReducers.locale(stateAfterFirstCall.locale, action);
				strictEqual(
					stateAfterFirstCall,
					stateAfterSecondCall,
					"Expected that the old state is returned"
				);
			});
		});
	});
});
