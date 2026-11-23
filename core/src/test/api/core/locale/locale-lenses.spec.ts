// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { Locale } from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";

import { LocaleLenses } from "../../../../core/locale/internal/locale-lenses.js";
import { createLensLawsTests } from "../../../utils/createLensLawsTests.js";

describe("core.locale", () => {
	describe("lenses", () => {
		describe("locale slice", () => {
			describe("single locale slice", () => {
				const state = { locale: Locale.fromString("de_DE") };
				const locale = state.locale;
				createLensLawsTests(LocaleLenses.locale, state, locale);
			});
		});
	});
});
