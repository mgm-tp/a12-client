// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { ApplicationLenses } from "../../../../core/application/index.js";
import { createLensLawsTests } from "../../../utils/createLensLawsTests.js";

describe("core.application", () => {
	describe("lenses", () => {
		describe("busy property", () => {
			describe("busy false", () => {
				const state = { application: { busy: false } };
				const busy = state.application.busy;
				createLensLawsTests(ApplicationLenses.busy, state, busy);
			});

			describe("busy true", () => {
				const state = { application: { busy: true } };
				const busy = state.application.busy;
				createLensLawsTests(ApplicationLenses.busy, state, busy);
			});
		});
	});
});
