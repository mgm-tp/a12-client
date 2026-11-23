// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { equal, partialDeepStrictEqual, throws } from "node:assert/strict";

import { ActivityActions } from "../../../../../../core/activity/internal/actions.js";
import { createCallDescriptors } from "../../../../../../core/application/internal/sagas/data/createCallDescriptors.js";
import type { DataProvider } from "../../../../../../core/data/internal/DataProvider.js";
import { setupActivityMap } from "../../../../../api/core/activity/util.js";
import { createActivity, createDataHolder } from "../../../../../utils/activity.js";

describe("core.application", () => {
	describe("createCallDescriptors", () => {
		it("returns a call descriptor per matching provider with its correct dataholders", () => {
			const params = createParams({
				dataProviders: [
					{
						name: "OnlyEven",
						canHandle: c => c.dataHolder.descriptor.type === "t2",
						*provideData() {}
					},
					{
						name: "OnlyUneven",
						canHandle: c => c.dataHolder.descriptor.type === "t1",
						*provideData() {}
					}
				]
			});
			const descriptors = createCallDescriptors(params);

			equal(descriptors.length, 2);
			partialDeepStrictEqual(descriptors, [
				{
					dataProvider: { name: "OnlyEven" },
					config: { dataHolders: [{ descriptor: { type: "t2" } }] }
				},
				{
					dataProvider: { name: "OnlyUneven" },
					config: { dataHolders: [{ descriptor: { type: "t1" } }] }
				}
			]);
		});

		it("returns only one call descriptor for the first matching provider if multiple exist", () => {
			const params = createParams({
				dataProviders: [
					{
						name: "OnlyT1_a",
						canHandle: c => c.dataHolder.descriptor.type === "t1",
						*provideData() {}
					},
					{
						name: "OnlyT1_b",
						canHandle: c => c.dataHolder.descriptor.type === "t1",
						*provideData() {}
					}
				]
			});
			const descriptors = createCallDescriptors(params);

			equal(descriptors.length, 1);
			partialDeepStrictEqual(descriptors, [
				{
					dataProvider: { name: "OnlyT1_a" }
				}
			]);
		});

		describe("should return an empty array when", () => {
			it("no data providers are given", () => {
				const params = createParams({
					dataProviders: []
				});
				const descriptors = createCallDescriptors(params);

				equal(descriptors.length, 0);
			});

			it("no data provider can handle anything", () => {
				const params = createParams({
					dataProviders: [
						{
							name: "TestProvider",
							canHandle: () => false,
							*provideData() {}
						}
					]
				});
				const descriptors = createCallDescriptors(params);

				equal(descriptors.length, 0);
			});

			it("the activity does not exist", () => {
				const params = createParams({
					action: ActivityActions.loadData({ activityId: "doesNotExist" })
				});
				const descriptors = createCallDescriptors(params);

				equal(descriptors.length, 0);
			});

			it("no data holders are relevant", () => {
				const params = createParams({ isRelevant: () => false });
				const descriptors = createCallDescriptors(params);

				equal(descriptors.length, 0);
			});
		});

		describe("additionalDetails", () => {
			it("should contain the action payload in the config details when not given", () => {
				const payloadRest = { missingOnly: true, other: "value" };

				const params = createParams({
					additionalDetails: undefined,
					action: ActivityActions.loadData({ activityId: "1", ...payloadRest })
				});
				const descriptors = createCallDescriptors(params);

				partialDeepStrictEqual(descriptors, [{ config: { details: payloadRest } }]);
			});

			it("should contain the result of additionalDetails in the config details when given", () => {
				const details = { custom: "value" };
				const params = createParams({
					additionalDetails: () => details as DataProvider.LoadDataActionPayload
				});
				const descriptors = createCallDescriptors(params);

				partialDeepStrictEqual(descriptors, [{ config: { details } }]);
			});
		});

		describe("when not all relevant data holders are handled", () => {
			it("should return all found descriptors if assertAllHandled is falsy", () => {
				const params = createParams({
					assertAllHandled: false,
					dataProviders: [
						{
							name: "OnlyT1",
							canHandle: c => c.dataHolder.descriptor.type === "t1",
							*provideData() {}
						}
					]
				});
				const descriptors = createCallDescriptors(params);

				equal(descriptors.length, 1);
				partialDeepStrictEqual(descriptors, [{ dataProvider: { name: "OnlyT1" } }]);
			});

			it("should throw an error if assertAllHandled=true", () => {
				const params = createParams({
					assertAllHandled: true,
					dataProviders: [
						{
							name: "OnlyT1",
							canHandle: c => c.dataHolder.descriptor.type === "t1",
							*provideData() {}
						}
					]
				});

				throws(() => createCallDescriptors(params));
			});
		});
	});
});

type Params = Parameters<typeof createCallDescriptors>[0];
function createParams(params?: Partial<Params>): Params {
	return {
		operation: "load",
		dataProviders: [
			{
				name: "TestProvider",
				canHandle: () => true,
				*provideData() {}
			}
		],
		activities: setupActivityMap([
			createActivity({
				id: "1",
				dataHolders: [
					createDataHolder({ descriptor: { type: "t1" } }),
					createDataHolder({ descriptor: { type: "t2" } })
				]
			}),
			createActivity({
				id: "2",
				dataHolders: [
					createDataHolder({ descriptor: { type: "t3" } }),
					createDataHolder({ descriptor: { type: "t4" } })
				]
			})
		]),
		isRelevant: () => true,
		action: ActivityActions.loadData({ activityId: "1" }),
		...params
	};
}
