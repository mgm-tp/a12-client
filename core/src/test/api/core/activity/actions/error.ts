// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepStrictEqual, ok, strictEqual } from "node:assert/strict";

import {
	Activity,
	ActivityActions,
	ActivityReducers,
	ActivitySelectors
} from "../../../../../core/activity/index.js";
import { createActivity, createDataHolder } from "../../../../utils/activity.js";

import { selectActivity } from "../reducer-test-utils.js";
import { setupActivityMap } from "../util.js";

export function executeTestForError(): void {
	describe("when the operationType from the payload is loading", () => {
		it(
			"returns a new ActivityMap, in which the activity with the id from the action payload " +
				"now has the error from the payload, 'error' for the loadingState, and is not busy",
			() => {
				const testError = new Error("error happened");
				const state = setupActivityMap([
					createActivity({
						id: "1",
						activityDataHolder: { savingState: "saving" }
					})
				]);
				const action = ActivityActions.error({
					activityId: "1",
					operationType: "loading",
					error: testError
				});

				const actualActivityMap = ActivityReducers.activities(state, action);

				const activity = selectActivity(actualActivityMap)("1")!;
				const error = Activity.findDefaultDataHolder(activity)?.error;

				ok(Activity.Error.isInstance(error) && "message" in error);

				strictEqual(error.message, testError.message);
				strictEqual(ActivitySelectors.loadingState(activity).state, "error");
			}
		);

		it("returns a new unchanged ActivityMap if the activity does not need to be updated", () => {
			const internalClientError: Activity.Error.InternalClient = {
				errorCode: "INTERNAL_CLIENT_ERROR",
				message: "error happened"
			};
			const state = setupActivityMap([createActivity({ id: "1" })]);
			const action = ActivityActions.error({
				activityId: "1",
				operationType: "loading",
				error: internalClientError
			});

			// first execution of the reducer
			const updatedActivityMap = ActivityReducers.activities(state, action);

			// second execution does not change the map
			const actualActivityMap = ActivityReducers.activities(updatedActivityMap, action);
			deepStrictEqual(actualActivityMap, actualActivityMap);
		});
	});

	describe("when the operationType from the payload is saving", () => {
		it(
			"returns a new ActivityMap, in which the activity with the id from the action payload " +
				"now has the error from the payload and 'error' for the savingState",
			() => {
				const testError = new Error("hi");
				const stateLocal = setupActivityMap([
					createActivity({
						id: "1",
						activityDataHolder: { loadingState: "loaded" }
					})
				]);
				const action = ActivityActions.error({
					activityId: "1",
					operationType: "saving",
					error: testError
				});

				const actualActivityMap = ActivityReducers.activities(stateLocal, action);

				const activity = selectActivity(actualActivityMap)("1")!;
				const error = Activity.findDefaultDataHolder(activity)?.error;

				ok(Activity.Error.isInstance(error) && "message" in error);
				strictEqual(error.message, testError.message);
				const savingState = ActivitySelectors.savingState(activity).state;
				strictEqual(savingState, "error");
			}
		);

		it("returns a new unchanged ActivityMap if the activity does not need to be updated", () => {
			const testError = new Error("hi");
			const stateLocal = setupActivityMap([
				createActivity({
					id: "1",
					activityDataHolder: { loadingState: "loading" }
				})
			]);
			const action = ActivityActions.error({
				activityId: "1",
				operationType: "saving",
				error: testError
			});

			// first execution of the reducer
			const updatedActivityMap = ActivityReducers.activities(stateLocal, action);

			// second execution does not change the map
			const actualActivityMap = ActivityReducers.activities(updatedActivityMap, action);
			deepStrictEqual(actualActivityMap, actualActivityMap);
		});

		describe("when the error in the payload is undefined", () => {
			describe("when the savingState of the activity was not yet 'error'", () => {
				it(
					"returns a new ActivityMap, in which the activity with the id from the action payload " +
						"now has a new Activity.Error and the savingState 'error'",
					() => {
						const stateLocal = setupActivityMap([
							createActivity({
								id: "1",
								dataHolders: [
									createDataHolder({ loadingState: "loading" }),
									createDataHolder({ savingState: "not_saved" })
								]
							})
						]);
						const action = ActivityActions.error({
							activityId: "1",
							operationType: "saving",
							error: undefined
						});

						const actualActivityMap = ActivityReducers.activities(stateLocal, action);

						const activity = selectActivity(actualActivityMap)("1")!;
						const error = Activity.findDefaultDataHolder(activity)?.error;

						ok(Activity.Error.isInstance(error) && "message" in error);
						strictEqual(error.message, "Error is null or undefined");
						const savingState = ActivitySelectors.savingState(activity);
						strictEqual(savingState.state, "error");
					}
				);
			});

			describe("when the savingState of the activity was already 'error'", () => {
				it(
					"returns a new ActivityMap, in which the activity with the id from the action payload " +
						"now has a new Activity.Error and still the savingState 'error'",
					() => {
						const stateLocal = setupActivityMap([
							createActivity({
								id: "1",
								activityDataHolder: {
									loadingState: "loading",
									savingState: "error"
								}
							})
						]);
						const action = ActivityActions.error({
							activityId: "1",
							operationType: "saving",
							error: undefined
						});

						const actualActivityMap = ActivityReducers.activities(stateLocal, action);

						const activity = selectActivity(actualActivityMap)("1")!;
						const error = Activity.findDefaultDataHolder(activity)?.error;

						ok(Activity.Error.isInstance(error) && "message" in error);
						strictEqual(error.message, "Error is null or undefined");
						const savingState = ActivitySelectors.savingState(activity);
						strictEqual(savingState.state, "error");
					}
				);
			});
		});
	});
}
