// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { strictEqual } from "node:assert/strict";

import { Activity } from "../../../../core/activity/index.js";
import { createActivity, createDataHolder } from "../../../utils/activity.js";

describe("core.activity", () => {
	describe("findDefaultDataHolder", () => {
		const descriptor: Activity.Descriptor = { instance: "ABC" };

		it("returns undefined if the provided activity is undefined", () => {
			strictEqual(Activity.findDefaultDataHolder(undefined), undefined);
		});

		it("returns undefined if the provided activity does not contain a default data holder", () => {
			const otherDh = createDataHolder({ descriptor: { ...descriptor, other: "XYZ" } });

			const activityMock = createActivity({
				id: "1",
				descriptor,
				dataHolders: [otherDh]
			});

			strictEqual(Activity.findDefaultDataHolder(activityMock), undefined);
		});

		it("returns the default data holder if the provided activity contains a default data holder", () => {
			const defaultDh = createDataHolder({ descriptor });
			const otherDh = createDataHolder({ descriptor: { ...descriptor, other: "XYZ" } });

			const activityMock = createActivity({
				id: "1",
				descriptor,
				dataHolders: [defaultDh, otherDh]
			});

			strictEqual(Activity.findDefaultDataHolder(activityMock), defaultDh);
		});
	});
});
