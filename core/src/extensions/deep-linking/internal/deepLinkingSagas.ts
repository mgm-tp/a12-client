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
import { call, delay, put, race, select, take, takeEvery } from "typed-redux-saga";

import type { Action, ActionCreator } from "@com.mgmtp.a12.client/typescript-fsa-redux-5-compat";
import { LoggerFactory } from "@com.mgmtp.a12.utils/utils-logging";

import { Activity, ActivityActions, ActivitySelectors } from "../../../core/activity/index.js";
import { ActivityUtils } from "../../../core/application/internal/sagas/utils.js";
import { assertObject } from "../../../core/assertion.js";
import { ModelSelectors } from "../../../core/model/index.js";

import type { DeepLinkCoder } from "./deepLinkCoder.js";
import { ActivityDescriptorBasedDeepLinkCoder } from "./deepLinkCoder.js";

const logger = LoggerFactory.getLogger("extensions/deep-linking");

/**
 * Configuration, that influences how the deep linking is performed.
 */
export interface Configuration {
	/**
	 * Coder to encode/decode information in/from the deep link.
	 */
	readonly deepLinkCoder?: DeepLinkCoder;

	/**
	 * Time in milliseconds, that is waited for source activity to load its data. When it expires
	 * and data is not loaded, the function navigateToActivity aborts and the dependent activity
	 * won't be created.
	 */
	readonly loadingTimeout?: number;

	/**
	 * Manages current activity location (URL) in the application.
	 */
	readonly locationManager?: CurrentActivityLocationManager;

	/**
	 * If any of these given type of actions are dispatched,
	 * the current deep link is applied.
	 */
	// oxlint-disable-next-line typescript/no-explicit-any
	readonly applyTriggers?: ActionCreator<any>[];

	/**
	 * If any of these given type of actions are dispatched,
	 * the current deep link is updated.
	 *
	 * It will always act on:
	 * * {@link ActivityActions.push},
	 * * {@link ActivityActions.cancel},
	 * * {@link ActivityActions.commit}.done
	 * * {@link ActivityActions.setData}
	 */
	// oxlint-disable-next-line typescript/no-explicit-any
	readonly updateTriggers?: ActionCreator<any>[];

	/**
	 * If any of these given type of actions are dispatched,
	 * the current deep link is cleared.
	 */
	// oxlint-disable-next-line typescript/no-explicit-any
	readonly clearTriggers?: ActionCreator<any>[];
}

/**
 * Manages current activity location (URL) in the application.
 */
export interface CurrentActivityLocationManager {
	/**
	 * Returns current activity location.
	 */
	getLocation(): string;

	/**
	 * Returns deep link part in the current location.
	 */
	getDeepLink(): string;

	/**
	 * Sets deep link part in the current location, replacing the browser history.
	 * @param deepLink the deep link
	 */
	setDeepLink(deepLink: string): void;
}

/** @internal */
export const browserLocationManager: CurrentActivityLocationManager = {
	getLocation(): string {
		if (typeof location === "undefined") {
			return "";
		}

		return location.toString();
	},
	getDeepLink(): string {
		if (typeof location === "undefined") {
			return "";
		}

		return location.hash.replace(/^#/, "");
	},
	setDeepLink(deepLink: string): void {
		if (typeof history === "undefined") {
			return;
		}

		let nextHash = deepLink;
		if (!deepLink.startsWith("#")) {
			nextHash = "#" + nextHash;
		}
		history.replaceState(undefined, "", nextHash);
	}
};

/**
 * @internal
 *
 * Watches for all actions contained in config.applyTriggers,
 * to navigate to the initial activity of the appmodel, if set.
 *
 * @param config the configuration
 */
export function* loadWelcomePage({ applyTriggers }: Configuration): SagaGenerator<void> {
	if (applyTriggers) {
		yield* takeEvery(applyTriggers, handleLoadWelcomePage);
	}
}

/** @internal */
export function* handleLoadWelcomePage(): SagaGenerator<void> {
	try {
		const { content } = yield* select(ModelSelectors.applicationModel());
		if (content.initialActivity) {
			const pushActionToUse = yield* call(
				ActivityUtils.createInitialActivity,
				content.initialActivity
			);
			yield* put(pushActionToUse);
		}
	} catch (error) {
		logger.error(error);
	}
}

/**
 * @internal
 *
 * Watches for actions, that replace the active (last activated) activity, or change its relation to other activities.
 * This includes the following actions:
 * - pushActivity: pushes a new activity, that becomes the active one
 * - cancelActivity: cancels an activity, which can make another one active
 * - commitActivity: commits an activity, which can make another one active
 * - setActivityData: for activities, that need to load data, it is the last step that is performed after push; it can
 * set relations to other activities, like datasourceActivityId, which has impact on a deep link
 *
 * This list can be extended with further actions, that then need to be provided in the configuration.
 *
 * When any of those actions happens, the deep link is updated to reflect the active activity.
 *
 * @param config the configuration
 */
export function* updateDeepLink(config: Configuration): SagaGenerator<void> {
	yield* takeEvery(
		[
			ActivityActions.push,
			ActivityActions.cancel,
			ActivityActions.commit.done,
			ActivityActions.setData,
			...(config.updateTriggers ?? [])
		],
		handleUpdateDeepLink,
		config
	);
}

/** @internal */
export function* handleUpdateDeepLink(config: Configuration): SagaGenerator<void> {
	const {
		deepLinkCoder = new ActivityDescriptorBasedDeepLinkCoder(),
		locationManager = browserLocationManager
	} = config;
	const activity = yield* select(ActivitySelectors.latestActivity());
	if (activity !== undefined) {
		const deepLink = deepLinkCoder.encode(activity, yield* call(getSourceActivities, activity.id));
		locationManager.setDeepLink(deepLink);
	} else {
		yield* call(handleClearDeepLink, config);
	}
}

/**
 * @internal
 *
 * Watches for all actions contained in config.applyDeepLinkActions,
 * to navigate to the activity encoded in the location's deep link, if set.
 * If not, navigate to the initial activity of the appmodel, if set.
 *
 * @param config the configuration
 */
export function* applyDeepLink(config: Configuration): SagaGenerator<void> {
	if (config.applyTriggers) {
		yield* takeEvery(config.applyTriggers, handleApplyDeepLink, config);
	}
}

/** @internal */
export function* handleApplyDeepLink(config: Configuration): SagaGenerator<void> {
	const {
		deepLinkCoder = new ActivityDescriptorBasedDeepLinkCoder(),
		loadingTimeout = 5000,
		locationManager = browserLocationManager
	} = config;
	try {
		logger.log(`Navigate to ${locationManager.getLocation()}`);

		const deepLink = locationManager.getDeepLink();

		if (deepLink === "") {
			yield* call(handleLoadWelcomePage);
		}

		// FIXME: do we really need to set the datasourceActivityId here?
		let dataSourceActivityId: string | undefined;
		for (const action of deepLinkCoder.decode(deepLink)) {
			const actionToUse = yield* call(ActivityUtils.determineLoadingState, action);

			yield* call(dispatchActivityAction, actionToUse, dataSourceActivityId, loadingTimeout);
			dataSourceActivityId = actionToUse.payload.activity.id;
		}
	} catch (error) {
		logger.error(error);
		yield* call(handleClearDeepLink, config);
		yield* call(handleLoadWelcomePage);
	}
}

/**
 * @internal
 *
 * Watches for all actions contained in config.clearDeepLinkActions,
 * to clear the current deep link
 *
 * @param config the configuration
 */
export function* clearDeepLink(config: Configuration): SagaGenerator<void> {
	if (config.clearTriggers) {
		yield* takeEvery(config.clearTriggers, handleClearDeepLink, config);
	}
}

function* handleClearDeepLink(config: Configuration): SagaGenerator<void> {
	const { locationManager = browserLocationManager } = config;
	logger.log(`Resetting deep link in location ${locationManager.getLocation()}`);
	locationManager.setDeepLink("");
}

function* dispatchActivityAction(
	action: Action<{ activity: Activity }>,
	datasourceActivityId: string | undefined,
	loadingTimeout: number
): SagaGenerator<void> {
	if (datasourceActivityId !== undefined) {
		const { timeout } = yield* race({
			wait: call(waitUntilActivityIsReady, datasourceActivityId),
			timeout: call(delay, loadingTimeout)
		});
		if (timeout === true) {
			throw new Error(`Activity ${datasourceActivityId} was not loaded within defined timeout`);
		}
	}
	yield* put(maybeAddDataSourceActivityId(action, datasourceActivityId));
}

function* waitUntilActivityIsReady(activityId: string): SagaGenerator<void> {
	while (!(yield* call(isActivityReady, activityId))) {
		yield* take();
	}
}

function* isActivityReady(activityId: string): SagaGenerator<boolean> {
	const sourceActivity = yield* select(ActivitySelectors.activityById(activityId));
	assertObject(sourceActivity);

	const loadingState = ActivitySelectors.loadingState(sourceActivity);
	if (loadingState.state === "loaded" || loadingState.state === "without") {
		return true;
	} else if (loadingState.state === "error") {
		throw new Error(`Loading data for activity ${activityId} failed`);
	} else {
		return false;
	}
}

function* getSourceActivities(activityId: string): SagaGenerator<Activity[]> {
	const activity = yield* select(ActivitySelectors.activityById(activityId));
	const datasourceActivityId = Activity.findDefaultDataHolder(activity)?.datasourceActivityId;
	if (datasourceActivityId !== undefined) {
		const sourceActivity = yield* select(ActivitySelectors.activityById(datasourceActivityId));
		assertObject(sourceActivity);
		return [...(yield* call(getSourceActivities, sourceActivity.id)), sourceActivity];
	} else {
		return [];
	}
}

function maybeAddDataSourceActivityId(
	action: Action<{ activity: Activity }>,
	datasourceActivityId?: string
): Action<{ activity: Activity }> {
	const defaultDh = Activity.findDefaultDataHolder(action.payload.activity);

	return datasourceActivityId
		? {
				...action,
				payload: {
					...action.payload,
					activity: {
						...action.payload.activity,
						dataHolders: action.payload.activity.dataHolders.map(dh =>
							dh === defaultDh ? { ...dh, datasourceActivityId } : dh
						)
					}
				}
			}
		: action;
}
