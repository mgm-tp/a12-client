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
 * 1. Open-Source License – EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

import { deepStrictEqual, notStrictEqual, strictEqual, throws } from "node:assert/strict";

import type { Activity } from "../../../../core/activity/index.js";
import { ActivityActions } from "../../../../core/activity/index.js";
import { ActivityDescriptorBasedDeepLinkCoder } from "../../../../extensions/deep-linking/internal/deepLinkCoder.js";
import { createActivity } from "../../../utils/activity.js";

interface TestData {
	descriptor: Activity.Descriptor;
	sourceActivitiesDescriptors?: Activity.Descriptor[];
	link: string;
}

const testData: {
	uriInvalidCharacters: TestData;
	multipleActivities: TestData;
} = {
	uriInvalidCharacters: {
		descriptor: {
			model: "test_model",
			instance: "test_model/1",
			"prop 1": "prop1 value"
		},
		link: "model:test_model,instance:test_model%2F1,prop%201:prop1%20value"
	},

	multipleActivities: {
		descriptor: {
			model: "test_model3",
			instance: "test_model3/3"
		},
		sourceActivitiesDescriptors: [
			{
				model: "test_model1",
				instance: "test_model1/1"
			},
			{
				model: "test_model2",
				instance: "test_model2/2"
			}
		],
		link:
			"model:test_model1,instance:test_model1%2F1" +
			"/model:test_model2,instance:test_model2%2F2" +
			"/model:test_model3,instance:test_model3%2F3"
	}
};

describe("extensions.deep-linking.internal.deepLinkCoder", () => {
	const coder = new ActivityDescriptorBasedDeepLinkCoder();

	describe("encode", () => {
		describe("given an activity and a list of activities, that might be a data source for the activity", () => {
			it("encodes all keys and values in activity's descriptor", () => {
				const activityMock = createActivity({
					id: "1",
					descriptor: testData.uriInvalidCharacters.descriptor
				});

				const deepLink = coder.encode(activityMock, []);

				strictEqual(deepLink, testData.uriInvalidCharacters.link);
			});

			it("ignores properties with undefined values", () => {
				const testDescriptor: Activity.Descriptor = {
					model: "test_model",
					instance: "1",
					prop1: undefined,
					prop2: ""
				};
				const activityMock = createActivity({ id: "1", descriptor: testDescriptor });

				const deepLink = coder.encode(activityMock, []);

				strictEqual(deepLink, "model:test_model,instance:1,prop2:");
			});

			it("can encode the multiple activities from the data source list", () => {
				const deepLink = coder.encode(
					createActivityWithDescriptor(testData.multipleActivities.descriptor),
					testData.multipleActivities.sourceActivitiesDescriptors!.map(createActivityWithDescriptor)
				);

				strictEqual(deepLink, testData.multipleActivities.link);
			});
		});
	});

	describe("decode", () => {
		describe("given a deeplink", () => {
			it("can decode the link, when it describes a single activity", () => {
				const actions = coder.decode(testData.uriInvalidCharacters.link);

				strictEqual(actions.length, 1);

				const { type, payload } = actions[0];
				strictEqual(type, ActivityActions.push.type);
				notStrictEqual(payload.activity.id, "", "Activity should have a valid ID");
				deepStrictEqual(payload.activity.descriptor, testData.uriInvalidCharacters.descriptor);
			});

			it("can decode the link encoding multiple activities", () => {
				const actions = coder.decode(testData.multipleActivities.link);

				strictEqual(actions.length, 3);

				for (const action of actions) {
					strictEqual(action.type, ActivityActions.push.type);
					notStrictEqual(action.payload.activity.id, "", "Activity should have a valid ID");
				}

				const descriptors = actions.map(a => a.payload.activity.descriptor);
				const testDescriptors = [
					...testData.multipleActivities.sourceActivitiesDescriptors!,
					testData.multipleActivities.descriptor
				];
				deepStrictEqual(descriptors, testDescriptors);
			});

			it("does not validate the created activity descriptor", () => {
				const actions = coder.decode("prop1:one,prop2:two,prop3:");
				strictEqual(actions.length, 1);
				deepStrictEqual(actions[0].payload.activity.descriptor, {
					prop1: "one",
					prop2: "two",
					prop3: ""
				});
			});
		});

		describe("given an empty string", () => {
			it("returns an empty array", () => {
				deepStrictEqual(coder.decode(""), []);
			});
		});

		describe("given a wrong formatted string", () => {
			it("produces a syntax error", () => {
				throws(() => coder.decode("one/two/three"), SyntaxError);
			});
		});
	});
});

function createActivityWithDescriptor(descriptor: Activity.Descriptor): Activity {
	return createActivity({ id: Math.random().toString(), descriptor });
}
