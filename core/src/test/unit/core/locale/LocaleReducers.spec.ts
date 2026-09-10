/*
 * SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
 *
 * Copyright (c) 2012-2026 mgm technology partners GmbH
 *
 * Dual License
 * ------------
 * This source file is part of the mgm A12 Platform and available under
 * a choice of two different licenses:
 *
 * 1. Open-Source License - EUPL v1.2
 *    You may redistribute and/or modify this file under the terms of the
 *    European Union Public License, version 1.2 - see https://eupl.eu/.
 *
 * 2. Commercial License
 *    Alternatively, you may obtain a commercial license from
 *    mgm technology partners GmbH, that permits use of this software
 *    under different terms (including support and maintenance services).
 *
 *    Please contact a12-license@mgm-tp.com for more information.
 *
 * You must select and comply with exactly one of the above license options.
 *
 * Warranty Disclaimer (applies to either option)
 * ----------------------------------------------
 * THIS SOFTWARE IS PROVIDED "AS IS" AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

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
