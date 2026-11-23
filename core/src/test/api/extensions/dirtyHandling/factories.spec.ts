// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { strictEqual } from "node:assert/strict";

import type { AnyAction } from "redux";

import { ActivityActions } from "../../../../core/activity/index.js";
import { DirtyHandlingFactories } from "../../../../extensions/dirtyHandling/index.js";

describe("extensions.dirtyHandling.factories", () => {
	describe("createSagas", () => {
		describe(" returns an array of one anonymous platform saga,", () => {
			const sagas = DirtyHandlingFactories.createSagas();
			describe("which", () => {
				const dirtyHandlingSaga = sagas[0];
				it("can handle ActivityActions.cancelRequested", () => {
					strictEqual(dirtyHandlingSaga.canHandle({}, ActivityActions.cancelRequested), true);
				});

				it("can not handle any other action", () => {
					const emptyAction: AnyAction = { type: "EmptyAction", payload: {} };
					strictEqual(dirtyHandlingSaga.canHandle({}, emptyAction), false);
				});
			});
		});
	});
});
