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

import deepEqual from "fast-deep-equal";
import type { Store } from "redux";

import type { ApplicationModel } from "@com.mgmtp.a12.client/client-core";
import {
	Activity,
	ActivityActions,
	ActivityMap,
	ActivitySelectors,
	NEW_INSTANCE_IDENTIFIER,
	ViewSelectors
} from "@com.mgmtp.a12.client/client-core";

import type { DocumentListData } from "../mocks/SimpleOverview/data.js";

import type { Action, Predicate } from "./Action.js";
import type { StateHistory } from "./factories.js";
import { getIdOfDocument } from "./handleStore.js";

export class ActionProcessor {
	private activityId = 0;

	constructor(private store: Store<object>) {}

	executeStep(action: Action): Promise<unknown> {
		const waitForStepFinishedPromise = action.actionFinished
			? waitFor(this.store, action.actionFinished)
			: Promise.resolve();
		let stepPromise: Promise<unknown>;

		switch (action.type) {
			case "START_ACTIVITY": {
				stepPromise = this.startActivity(action.descriptor, action.child !== true);
				break;
			}
			case "ADD_VALUES_TO_DOC": {
				stepPromise = action.modelName
					? this.fillDocument(action.data)
					: this.addData(action.data, action.dirty);
				break;
			}
			case "CANCEL_ACTION": {
				stepPromise = this.cancel();
				break;
			}
			case "CANCEL_REQUESTED_ACTION": {
				stepPromise = this.cancelRequested(action.vetoDialogExpected);
				break;
			}
			case "COMMIT_ACTION": {
				stepPromise = this.commit(action.shouldSucceed);
				break;
			}
			case "DELETE_DOCUMENT": {
				stepPromise = this.deleteDocument(action.modelName, action.documentIndex);
				break;
			}
			/** ATTENTION: This is just working, if
			 * the main activity from this one should derive is the
			 * first activity in the store
			 * This means you have to do first
			 *  OPEN_MODEL - modelName
			 * and than you can open new or existing documents
			 */
			case "NEW_DOCUMENT": {
				stepPromise = this.openNewDocument(action.modelName);
				break;
			}
			/** ATTENTION: This is just working, if
			 * the main activity from this one should derive is the
			 * first activity in the store
			 * This means you have to do first
			 *  OPEN_MODEL - modelName
			 * and than you can open new or existing documents
			 */
			case "OPEN_DOCUMENT": {
				stepPromise = this.openDocument(action.documentModelName, action.documentIndex);
				break;
			}
			case "SET_DIRTY": {
				stepPromise = this.setDirty(action.dirty);
				break;
			}
			case "RESPONSE_CANCEL_CONFIRMATION_REQUIRED": {
				stepPromise = this.responseCancelConfirmationRequired(action.veto);
				break;
			}
		}

		return Promise.all([stepPromise, waitForStepFinishedPromise]);
	}

	private addData(data: object, dirty?: boolean): Promise<void> {
		const activity = ActivitySelectors.activityById("" + this.activityId)(this.store.getState());
		if (activity === undefined) {
			throw new Error(`Activity ${this.activityId} not found.`);
		}

		this.store.dispatch(ActivityActions.setData({ activityId: "" + this.activityId, data, dirty }));
		return Promise.resolve();
	}

	/** Cancels an action */
	private cancel(activityId?: string): Promise<{}> {
		const id = activityId !== undefined ? activityId : this.activityId;

		const promise = waitFor(
			this.store,
			StateChangePredicates.not(StateChangePredicates.activityExists(String(id)))
		);

		this.store.dispatch(
			ActivityActions.cancel({
				activityId: "" + id
			})
		);

		return promise;
	}

	private async cancelDocumentActivityIfPresent(mainActivity: Activity): Promise<void> {
		// Duplicate code as in OverviewCRUD
		// TODO: Middleware with this code
		const activityWithInstance = ActivitySelectors.childActivityWithInstance(mainActivity.id)(
			this.store.getState()
		);
		if (activityWithInstance !== undefined) {
			await this.cancel(activityWithInstance.id);
		}

		return Promise.resolve();
	}

	private async cancelTopLevelActivities(): Promise<void> {
		const topLevelActivities = ActivitySelectors.topLevelActivities()(this.store.getState());
		const keys = Object.keys(topLevelActivities);
		for (const key of keys) {
			await this.cancel(key);
		}

		return Promise.resolve();
	}

	/** Commit a change */
	private commit(shouldSucceed = true): Promise<{}> {
		const promise = shouldSucceed
			? waitFor(
					this.store,
					StateChangePredicates.not(StateChangePredicates.activityExists(String(this.activityId)))
				)
			: waitFor(
					this.store,
					StateChangePredicates.not(StateChangePredicates.saving(String(this.activityId)))
				);

		this.store.dispatch(ActivityActions.commit.started({ activityId: String(this.activityId) }));

		return promise;
	}

	/** Deletes a document */
	private deleteDocument(modelName: string, instance: number): Promise<void> {
		const topLevelActivities = ActivitySelectors.topLevelActivities()(this.store.getState());
		const activity = ActivityMap.toList(topLevelActivities).sort(
			(a, b) => b.activationTimestamp - a.activationTimestamp
		)[0];

		if (activity === undefined) {
			throw new Error(`Activity ${this.activityId} not found.`);
		}

		const instanceId = getIdOfDocument(activity, instance);
		if (instanceId === undefined) {
			throw new Error("Document for " + modelName + " could not be opened");
		}

		this.store.dispatch(ActivityActions.removeData({ instanceId, activityId: activity.id }));

		return Promise.resolve();
	}

	private fillDocument(dataValues: {}): Promise<void> {
		const activity = ActivitySelectors.activityById("" + this.activityId)(this.store.getState());
		if (activity === undefined) {
			throw new Error(`Activity ${this.activityId} not found.`);
		}

		const dataFromActivity = Activity.findDefaultDataHolder(activity)?.data as DocumentListData;

		// Modify data object
		const data = {
			...dataFromActivity,
			document: {
				...dataValues
			}
		};

		this.store.dispatch(ActivityActions.setData({ activityId: "" + this.activityId, data }));
		return Promise.resolve();
	}

	/** Opens an existing document */
	private async openDocument(documentModelName: string, documentIndex: number): Promise<{}> {
		const topLevelActivities = ActivitySelectors.topLevelActivities()(this.store.getState());
		const activity = ActivityMap.toList(topLevelActivities).sort(
			(a, b) => b.activationTimestamp - a.activationTimestamp
		)[0];
		if (activity === undefined) {
			throw new Error("No current activity");
		}

		await this.cancelDocumentActivityIfPresent(activity);
		const instanceId = getIdOfDocument(activity, documentIndex);
		if (instanceId === undefined) {
			throw new Error("Document with index: " + documentIndex + " was not found!");
		}

		this.activityId++;
		const promise = waitFor(
			this.store,
			StateChangePredicates.not(StateChangePredicates.loading(String(this.activityId)))
		);
		this.store.dispatch(
			ActivityActions.create({
				activityDescriptor: { model: documentModelName, instance: instanceId },
				activityId: "" + this.activityId,
				initiatingActivityId: activity.id
			})
		);

		return promise;
	}

	private async startActivity(
		activityDescriptor: Activity.Descriptor,
		topLevel: boolean
	): Promise<{}> {
		if (topLevel) {
			await this.cancelTopLevelActivities();
		}

		const latestActivity = ActivitySelectors.latestActivity()(this.store.getState());
		const initiatingId = topLevel ? undefined : latestActivity ? latestActivity.id : undefined;

		const newId = ++this.activityId;

		const condition = activityDescriptor.model
			? StateChangePredicates.not(StateChangePredicates.loading(newId.toString()))
			: StateChangePredicates.activityExists(newId.toString());
		const waitForCondition = waitFor(this.store, condition);

		this.store.dispatch(
			ActivityActions.create({
				activityDescriptor,
				activityId: newId.toString(),
				initiatingActivityId: initiatingId,
				loadingState: activityDescriptor.model ? undefined : "without"
			})
		);

		return waitForCondition;
	}

	/** Opens a new document */
	private async openNewDocument(modelName: string): Promise<{}> {
		const activity = ActivitySelectors.latestActivity()(this.store.getState());
		if (activity === undefined) {
			throw new Error("No current activity");
		}

		await this.cancelDocumentActivityIfPresent(activity);

		this.activityId = Number(activity.id) + 1;

		const promise = waitFor(
			this.store,
			StateChangePredicates.not(StateChangePredicates.loading(String(this.activityId)))
		);

		this.store.dispatch(
			ActivityActions.create({
				activityDescriptor: {
					model: modelName,
					instance: NEW_INSTANCE_IDENTIFIER
				},
				activityId: "" + this.activityId,
				initiatingActivityId: activity.id
			})
		);

		return promise;
	}

	/** Cancels an action */
	private cancelRequested(vetoDialogExpected: boolean, activityId?: string): Promise<{}> {
		const id = activityId !== undefined ? activityId : String(this.activityId);

		const promise = vetoDialogExpected
			? waitFor(this.store, StateChangePredicates.cancelConfirmationRequiredChanged(id, true))
			: waitFor(this.store, StateChangePredicates.not(StateChangePredicates.activityExists(id)));

		this.store.dispatch(
			ActivityActions.cancelRequested({
				activityIds: ["" + id]
			})
		);

		return promise;
	}

	/** Set the dirty state of an activity */
	private async setDirty(dirty: boolean): Promise<{}> {
		const activity = ActivitySelectors.activityById("" + this.activityId)(this.store.getState());
		if (activity === undefined) {
			throw new Error(`Activity ${this.activityId} not found.`);
		}
		const promise = waitFor(this.store, StateChangePredicates.activityWithDirtyState(dirty));

		this.store.dispatch(
			ActivityActions.setDirty({
				activityId: String(this.activityId),
				dirty: dirty
			})
		);

		return promise;
	}

	/* Triggers a responseCancelConfirmation action*/
	private responseCancelConfirmationRequired(veto: boolean): Promise<{}> {
		const activity = ActivitySelectors.activityById("" + this.activityId)(this.store.getState());
		if (activity === undefined) {
			throw new Error(`Activity ${this.activityId} not found.`);
		}
		const promise = waitFor(
			this.store,
			StateChangePredicates.cancelConfirmationRequiredChanged(activity.id)
		);

		this.store.dispatch(
			ActivityActions.responseCancelConfirmation({
				activityId: String(this.activityId),
				veto: veto
			})
		);

		return promise;
	}
}

// IMPORTANT: MUST BE CREATED **BEFORE** ANY RELEVANT ACTION IS DISPATCHED!!!
async function waitFor(store: Store<object>, p: Predicate, timeoutInMs = 8_000): Promise<true> {
	let wait: ReturnType<typeof setTimeout>;
	const promiseTimeout = new Promise<never>((_, reject) => {
		wait = setTimeout(() => {
			clearTimeout(wait);
			reject(
				new Error(p.description ? "Timeout wait for " + p.description : "Timeout in predicate " + p)
			);
		}, timeoutInMs);
	});

	const promiseUpdateState = new Promise<true>(resolve => {
		const unsubscribe = store.subscribe(() => {
			if (p(store.getState())) {
				unsubscribe();
				clearTimeout(wait);
				return resolve(true);
			}
		});
	});

	return Promise.race([promiseTimeout, promiseUpdateState]);
}

namespace StateChangePredicates {
	export function activityExists(activityId: string): Predicate {
		const result: Predicate = state => {
			if (activityId === undefined) {
				return false;
			}
			return ActivitySelectors.activityById(activityId)(state) !== undefined;
		};
		result.description = "activity " + activityId + " exists";
		return result;
	}

	export function cancelConfirmationRequiredChanged(
		activityId: string,
		cancelConfirmationRequired?: boolean
	): Predicate {
		return state => {
			const activity = ActivitySelectors.activityById(activityId)(state);
			if (activity === undefined) {
				throw new Error(`Activity ${activityId} not found.`);
			}
			return activity.cancelConfirmationRequired === cancelConfirmationRequired;
		};
	}

	export function activityWithPageDescriptor(descriptorName: string): Predicate {
		return state => {
			const lastActivity = ActivitySelectors.latestActivity()(state);
			if (lastActivity === undefined) {
				return false;
			}
			const descriptor: { [key: string]: string } = lastActivity.descriptor as {};
			return descriptor["page"] === descriptorName;
		};
	}

	export function activityWithRegion(
		expected: ApplicationModel.Region.Reference,
		shouldBeEmpty: boolean
	): Predicate {
		return state => {
			const lastActivity = ActivitySelectors.latestActivity()(state);
			if (lastActivity === undefined) {
				return false;
			}
			const regionViews = ViewSelectors.region(expected)(state).views;

			if (!shouldBeEmpty) {
				const lastActivityViewFound = regionViews.some(view => view.activityId === lastActivity.id);
				return lastActivityViewFound === true;
			} else {
				return regionViews.length === 0;
			}
		};
	}

	export function activityWithSavingState(expectedSavingState: Activity.SavingState): Predicate {
		return state => {
			const lastActivity = ActivitySelectors.latestActivity()(state);
			if (lastActivity === undefined) {
				return false;
			}
			return ActivitySelectors.savingState(lastActivity).state === expectedSavingState;
		};
	}

	export function activityWithDirtyState(expected: boolean): Predicate {
		return state => {
			const lastActivity = ActivitySelectors.latestActivity()(state);
			return lastActivity?.dataHolders.some(x => x.dirty) === expected;
		};
	}

	export function activityWithCancelConfirmationRequired(expected?: boolean): Predicate {
		return state => {
			const lastActivity = ActivitySelectors.latestActivity()(state);

			if (lastActivity === undefined) {
				return false;
			}
			return lastActivity.cancelConfirmationRequired === expected;
		};
	}

	export function activityWithInstanceName(expected?: string): Predicate {
		return state => {
			const lastActivity = ActivitySelectors.latestActivity()(state);
			if (lastActivity === undefined) {
				return false;
			}
			return lastActivity.descriptor.instance === expected;
		};
	}

	export function numberOfActivitiesActivityMap(count: number): Predicate {
		return state => {
			const actual = ActivitySelectors.activities()(state);
			return Object.keys(actual).length === count;
		};
	}

	export function stateObjectChanged(
		originalState: object,
		selector: (state: object) => object | undefined,
		name?: string
	): Predicate {
		const originalObject = selector(originalState);

		const func: Predicate = state => {
			const updatedObject = selector(state);
			return !deepEqual(originalObject, updatedObject);
		};
		func.description = name ?? selector.toString();
		return func;
	}

	export function fromLoadingToLoaded(
		activityId: string,
		stateHistory: StateHistory,
		oldLength: number
	): Predicate {
		const result: Predicate = () => {
			const entries = stateHistory.entries.slice(oldLength);
			for (const entry of entries) {
				const activitiesBefore: ActivityMap | undefined = ActivitySelectors.activities()(
					entry.stateBefore
				);
				const activitiesAfter: ActivityMap | undefined = ActivitySelectors.activities()(
					entry.stateAfter
				);

				if (activitiesAfter && activitiesBefore) {
					const activityBefore = activitiesBefore[activityId];
					const activityAfter = activitiesAfter[activityId];

					if (activityBefore && activityAfter) {
						if (
							ActivitySelectors.loadingState(activityBefore).state === "loading" &&
							ActivitySelectors.loadingState(activityAfter).state === "loaded"
						) {
							return true;
						}
					}
				}
			}
			return false;
		};
		result.description = "from loading to loaded of " + activityId;
		return result;
	}

	export function loading(activityId: string): Predicate {
		const pendingStates = ["missing", "loading"];

		const result: Predicate = state => {
			const activity = ActivitySelectors.activityById(activityId)(state);

			if (activity === undefined) {
				return true;
			}

			const loadingState = ActivitySelectors.loadingState(activity).state;
			return pendingStates.some(pendingState => pendingState === loadingState);
		};

		result.description = activityId + " loading ";
		return result;
	}

	export function saving(activityId: string): Predicate {
		const pendingStates = ["not_saved", "saving"];

		const result: Predicate = state => {
			if (activityExists(activityId)) {
				const activity = ActivitySelectors.activityById(activityId)(state);
				if (activity === undefined) {
					throw new Error(`Activity ${activityId} not found.`);
				}

				const savingState = ActivitySelectors.savingState(activity).state;
				const pending = pendingStates.indexOf(savingState) >= 0;

				if (!pending) {
					return false;
				}
			}

			return true;
		};
		result.description = activityId + " saving";
		return result;
	}

	export function not(p: Predicate): Predicate {
		const result: Predicate = state => !p(state);
		result.description = "not " + p.description;
		return result;
	}
}
