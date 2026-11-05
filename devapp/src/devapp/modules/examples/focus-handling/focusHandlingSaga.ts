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

import type { SagaGenerator } from "typed-redux-saga";
import { call, select, takeLatest } from "typed-redux-saga";

import type { Activity, Selector } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions, ActivitySelectors, StoreSagas } from "@com.mgmtp.a12.client/client-core";
import type { Action, Success } from "@com.mgmtp.a12.client/typescript-fsa-redux-5-compat";

import { assert } from "../../../utils/types.js";

import { focus } from "./focus.js";

export function createFocusSaga(): () => SagaGenerator<void> {
	let previouslyEditedInstance: string | undefined;

	return function* focusSaga() {
		yield* [
			yield* takeLatest(ActivityActions.push, handlePush),
			yield* takeLatest(ActivityActions.cancel, handleCancel),
			yield* takeLatest(ActivityActions.commit.done, handleCommitDone)
		];
	};

	/**
	 * If a new Activity is pushed, focus it.
	 *
	 * In case of a "form" Activity, also memorize the ID of the document (only
	 * used for cancel).
	 */
	function* handlePush(action: Action<ActivityActions.PushPayload>): SagaGenerator<void> {
		if (isOverviewActivity(action.payload.activity.descriptor)) {
			yield* call(focus, action.payload.activity.id);
			previouslyEditedInstance = undefined;
		} else if (isFormActivity(action.payload.activity.descriptor)) {
			yield* call(focus, action.payload.activity.id);
			previouslyEditedInstance = action.payload.activity.descriptor.instance;
		}
	}

	/**
	 * If the form Activity has been cancelled and no delete transaction is open,
	 * ...and we are back at the overview: focus the previously selected row or the add button,
	 *    if the canceled document was new.
	 * ...and we are at another form, focus it + memorize instance (see handlePush)
	 *
	 * If the form Activity has been cancelled and a delete transaction is open,
	 * then the cancel should not do anything because we need to wait for the reload
	 * of the data to focus the overview table.
	 */
	function* handleCancel(): SagaGenerator<void> {
		const latestActivity = yield* select(ActivitySelectors.latestActivity());
		if (latestActivity === undefined || !isFocusHandlingActivity(latestActivity.descriptor)) {
			// we are outside of the focus example
			return;
		}
		if (isOverviewActivity(latestActivity.descriptor)) {
			yield* call(focus, latestActivity.id, previouslyEditedInstance);
		} else if (isFormActivity(latestActivity.descriptor)) {
			yield* call(focus, latestActivity.id);
			previouslyEditedInstance = latestActivity.descriptor.instance;
		} else {
			throw new Error("unexpected state");
		}
	}

	/**
	 * If the form activity has been committed, we focus the previously selected row.
	 */
	function* handleCommitDone(
		action: Action<Success<ActivityActions.CommitPayload, { instance?: string }>>
	): SagaGenerator<void> {
		const latestActivity = yield* select(ActivitySelectors.latestActivity());
		if (latestActivity === undefined || !isFocusHandlingActivity(latestActivity.descriptor)) {
			// we are outside of the focus example
			return;
		}

		if (!isOverviewActivity(latestActivity.descriptor)) {
			throw new Error("unexpected action " + action.type);
		}

		const docId = action.payload.result.instance;
		if (docId === undefined) {
			throw new Error("Expected document instance in payload of commit.done action.");
		}

		const isLoading = yield* call(() =>
			StoreSagas.waitForStateChange(overviewLoadingState("loading"))
		);
		if (!isLoading) {
			return;
		}

		const isLoaded = yield* call(() =>
			StoreSagas.waitForStateChange(overviewLoadingState("loaded"))
		);
		if (isLoaded) {
			const a = yield* select(ActivitySelectors.latestActivity());
			assert(a);

			yield* call(focus, a.id, docId);
		}
	}
}

/**
 * Predicate to wait for the overview Activity to be reloaded. Is called once
 * with "loading" and then again with "loaded".
 */
function overviewLoadingState(
	awaitedState: Activity.LoadingState
): Selector<{ stateChanged: boolean; returnValue: boolean }> {
	return state => {
		const activities = ActivitySelectors.activities()(state);
		if (Object.keys(activities).length > 1) {
			return { stateChanged: false, returnValue: false };
		}

		const latestActivity = ActivitySelectors.latestActivity()(state);
		if (latestActivity === undefined || !isOverviewActivity(latestActivity.descriptor)) {
			return { stateChanged: true, returnValue: false };
		}

		const loadingState = ActivitySelectors.loadingState(latestActivity);
		if (loadingState.state === "error") {
			return { stateChanged: true, returnValue: false };
		} else if (loadingState.state === awaitedState) {
			return { stateChanged: true, returnValue: true };
		}
		return { stateChanged: false, returnValue: false };
	};
}

function isOverviewActivity(descriptor: Activity.Descriptor): boolean {
	return isFocusHandlingActivity(descriptor) && descriptor.instance === undefined;
}

function isFormActivity(descriptor: Activity.Descriptor): boolean {
	return isFocusHandlingActivity(descriptor) && descriptor.instance !== undefined;
}

const focusHandlingDescriptor = {
	section: "Examples",
	feature: "FocusHandling"
};

function isFocusHandlingActivity(descriptor: Activity.Descriptor): boolean {
	return Object.entries(focusHandlingDescriptor).every(([k, v]) => descriptor[k] === v);
}
