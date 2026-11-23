// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepStrictEqual } from "node:assert/strict";

import type { Activity, ActivityMap } from "../../../../../core/activity/index.js";
import { findActivitiesWithCaseChange } from "../../../../../core/model/internal/ModelLoader.js";
import { createActivity } from "../../../../utils/activity.js";

describe("core.model.internal", () => {
	describe("findActivitiesWithCaseChange", () => {
		type TestCase = {
			readonly description: string;
			readonly previousActivities: ActivityMap;
			readonly nextActivities: ActivityMap;
			readonly expectedIds: string[];
		};

		const testCases: TestCase[] = [
			{
				description: "returns the activities with changed cases",
				previousActivities: createActivityMap([
					{ id: "1", case: "caseA" },
					{ id: "2", case: "someCase" }
				]),
				nextActivities: createActivityMap([
					{ id: "1", case: "caseB" },
					{ id: "2", case: "someCase" }
				]),
				expectedIds: ["1"]
			},
			{
				description: "returns an empty array, if for no activity the case was changed",
				previousActivities: createActivityMap([
					{ id: "1", case: "caseA" },
					{ id: "2", case: "someCase" }
				]),
				nextActivities: createActivityMap([
					{ id: "1", case: "caseA" },
					{ id: "2", case: "someCase" }
				]),
				expectedIds: []
			},
			{
				description: "ignores new activities with cases",
				previousActivities: createActivityMap([{ id: "1", case: "caseA" }]),
				nextActivities: createActivityMap([
					{ id: "1", case: "caseA" },
					{ id: "2", case: "newCase" }
				]),
				expectedIds: []
			},
			{
				description: "ignores deleted activities with cases",
				previousActivities: createActivityMap([
					{ id: "1", case: "caseA" },
					{ id: "2", case: "someCase" }
				]),
				nextActivities: createActivityMap([{ id: "1", case: "caseB" }]),
				expectedIds: ["1"]
			},
			{
				description: "ignores activities with changed descriptor",
				previousActivities: createActivityMap([
					{ id: "1", case: "caseA" },
					{ id: "2", case: "someCase", descriptor: { instance: "modelA" } }
				]),
				nextActivities: createActivityMap([
					{ id: "1", case: "caseB" },
					{
						id: "2",
						case: "changedCase",
						descriptor: { instance: "changedModel" }
					}
				]),
				expectedIds: ["1"]
			},
			{
				description: "returns the id of an activity with the case changed to undefined",
				previousActivities: createActivityMap([
					{ id: "1", case: "caseA" },
					{ id: "2", case: "someCase" }
				]),
				nextActivities: createActivityMap([{ id: "1", case: "caseA" }, { id: "2" }]),
				expectedIds: ["2"]
			}
		];

		describeTests();

		function describeTests(): void {
			for (const testCase of testCases) {
				it(testCase.description, () => {
					const result = findActivitiesWithCaseChange(
						testCase.previousActivities,
						testCase.nextActivities
					);
					const resultIds = result.map(a => a.id);

					deepStrictEqual(resultIds, testCase.expectedIds);
				});
			}
		}

		type TestActivitySpec = {
			readonly id: string;
			readonly case?: string;
			readonly descriptor?: Activity.Descriptor;
		};

		function createActivityMap(testActivitySpecs: TestActivitySpec[]): ActivityMap {
			return testActivitySpecs.reduce((activityMap, currentSpec) => {
				return {
					...activityMap,
					[currentSpec.id]: createActivity({
						id: currentSpec.id,
						...(currentSpec.case ? { case: currentSpec.case } : {}),
						...(currentSpec.descriptor ? { descriptor: currentSpec.descriptor } : {})
					})
				};
			}, {});
		}
	});
});
