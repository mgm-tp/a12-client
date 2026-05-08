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

import type { SagaGenerator } from "typed-redux-saga";
import { call, fork, put, race, select, takeEvery } from "typed-redux-saga";

import { Activity, ActivityMap, ActivitySelectors } from "../../activity/index.js";
import { StoreSagas } from "../../store/index.js";
import { notUndefined } from "../../utils.js";

import { ModelActions } from "./actions.js";
import { checkUnsupportedModelVersion } from "./checkUnsupportedModelVersion.js";
import { expandDescriptors } from "./expandDescriptors.js";
import type { Model } from "./Model.js";
import type { ModelMap } from "./ModelState.js";
import { ModelSelectors } from "./selectors.js";
import type { SupportedModelVersions } from "./supportedModelVersions.js";

export interface ModelLoader {
	/**
	 * A unique name to identify the loader
	 */
	readonly name: string;

	readonly supportedModelVersions?: SupportedModelVersions;

	/**
	 * Loads an A12 model together with all of its referenced models.
	 *
	 * @param modelDescriptors List of model descriptors to load
	 * @param existingModels Map of already existing models
	 */
	load(modelDescriptors: Model.Descriptor[], existingModels: ModelMap): Promise<ModelMap>;
}

/** @internal */
export const InternalModelSagaFactory = {
	createModelLoadingSaga(loader: ModelLoader): () => SagaGenerator<void> {
		return () => loadModels(loader);
	}
};

/**
 * @internal
 */
export function* loadModels(loader: ModelLoader): SagaGenerator<void> {
	// handles loadModel actions and state changes in parallel
	yield* fork(loadModelsAction, loader);
	yield* fork(loadModelsForActivityChanges, loader);
}

function* loadModelsAction(loader: ModelLoader): SagaGenerator<void> {
	yield* takeEvery(ModelActions.loadModels, function* (action) {
		yield* call(load, loader, action.payload);
	});
}

function* loadModelsForActivityChanges(loader: ModelLoader): SagaGenerator<void> {
	while (true) {
		// we need to be blocking until a relevant state change happened
		const changedActivities = yield* call(getChangedActivities);

		// handling the change in a non-blocking way to not miss any state changes
		// while the loader is executed
		yield* fork(handleChangedActivities, loader, changedActivities);
	}
}

function* getChangedActivities(): SagaGenerator<Activity[]> {
	const existingActivities = yield* select(ActivitySelectors.activities());

	/*
	 * Waiting until either a new activity has been added or a case changed in
	 * the existing activities.
	 * When either happens, waiting for the other is canceled and waiting for
	 * both starts again with the next state.
	 */
	const [newActivities, activitiesWithCaseChange] = yield* race([
		call(() => StoreSagas.waitFor(NewActivities(existingActivities))),
		call(() => StoreSagas.waitFor(ActivitiesWithChangedCases(existingActivities)))
	]);

	return newActivities ?? activitiesWithCaseChange ?? [];
}

function* handleChangedActivities(
	loader: ModelLoader,
	changedActivities: Activity[]
): SagaGenerator<void> {
	const state = yield* select();
	const modelDescriptors = changedActivities.flatMap(activity =>
		ModelSelectors.modelDescriptorsByActivityId(activity.id)(state)
	);

	if (modelDescriptors.length > 0) {
		yield* call(load, loader, modelDescriptors);
	}
}

/**
 * Returns new activities or undefined when there are no new ones.
 */
function NewActivities(previousActivities: ActivityMap): StoreSagas.WaitForSelector<Activity[]> {
	return state => {
		const currentActivities = ActivitySelectors.activities()(state);

		const newActivities = findNewActivities(previousActivities, currentActivities);

		return newActivities.length > 0 ? newActivities : undefined;
	};
}

/**
 * Returns existing activities with case changes or undefined when no case changed.
 */
function ActivitiesWithChangedCases(
	previousActivities: ActivityMap
): StoreSagas.WaitForSelector<Activity[]> {
	return state => {
		const currentActivities = ActivitySelectors.activities()(state);

		const preExistingActivitiesWithCaseChange = findActivitiesWithCaseChange(
			previousActivities,
			currentActivities
		);

		return preExistingActivitiesWithCaseChange.length > 0
			? preExistingActivitiesWithCaseChange
			: undefined;
	};
}

/**
 * @internal
 *
 * Returns activities for which the case has changed compared to the previous state.
 *
 * Ignores new activities, since these are handled elsewhere. This includes
 * activities with same id but changed descriptor.
 *
 * Ignores removed activities, since no model loading is needed then.
 *
 * Doesn't ignore when the case has been set to undefined, since the default case might apply now.
 */
export function findActivitiesWithCaseChange(
	previousActivities: ActivityMap,
	currentActivities: ActivityMap
): Activity[] {
	const preExistingActivities = findPreExistingActivities(previousActivities, currentActivities);

	const isExistingActivity = (activity: Activity) => preExistingActivities.includes(activity);
	const hasActivityCaseChanged = (activity: Activity) =>
		previousActivities[activity.id]?.case !== currentActivities[activity.id]?.case;

	const isExistingActivityWithChangedCase = (activity: Activity) =>
		isExistingActivity(activity) && hasActivityCaseChanged(activity);

	return ActivityMap.toList(currentActivities).filter(isExistingActivityWithChangedCase);
}

/**
 * Returns the activities not existing before
 */
function findNewActivities(
	previousActivities: ActivityMap,
	currentActivities: ActivityMap
): Activity[] {
	return differenceWith(
		Object.values(currentActivities).filter(notUndefined),
		Object.values(previousActivities).filter(notUndefined),
		isEqualActivity
	);
}

/**
 * Returns the activities existing before
 */
function findPreExistingActivities(
	previousActivities: ActivityMap,
	currentActivities: ActivityMap
): Activity[] {
	return intersectionWith(
		Object.values(currentActivities).filter(notUndefined),
		Object.values(previousActivities).filter(notUndefined),
		isEqualActivity
	);
}

function differenceWith<T>(a: T[], b: T[], comparator: (aVal: T, bVal: T) => boolean): T[] {
	return a.filter(ae => b.every(be => !comparator(ae, be)));
}

function intersectionWith<T>(a: T[], b: T[], comparator: (aVal: T, bVal: T) => boolean): T[] {
	return a.filter(ae => b.some(be => comparator(ae, be)));
}

/**
 * Activities are viewed as equal, when the ids and the descriptors are equal
 */
function isEqualActivity(a: Activity, b: Activity): boolean {
	return a.id === b.id && Activity.Descriptor.equal(a.descriptor, b.descriptor);
}

/**
 * Calls the given `ModelLoader` with all descriptors that are requested and do not exist yet.
 */
function* load(loader: ModelLoader, modelDescriptors: Model.Descriptor[]): SagaGenerator<void> {
	const finalDescriptors = yield* call(findTransitiveMissingModelDescriptors, modelDescriptors);

	if (finalDescriptors.length > 0) {
		const existingModels = yield* select(ModelSelectors.models());

		const modelMap = yield* call([loader, "load"], finalDescriptors, existingModels);

		const checkedModelMap = yield* call(
			checkUnsupportedModelVersion,
			modelMap,
			loader.supportedModelVersions
		);

		yield* put(ModelActions.setModels(checkedModelMap));
	}
}

/**
 * Returns transitive descriptors for missing models, starting from the given
 * descriptors.
 *
 * 1. Removes all descriptors which already exist in the model slice.
 * 2. For the remaining ones, adds their referenced models by querying the model graph
 */
function* findTransitiveMissingModelDescriptors(
	modelDescriptors: Model.Descriptor[]
): SagaGenerator<Model.Descriptor[]> {
	const state = yield* select();
	const modelGraph = yield* select(ModelSelectors.modelGraph());

	const missingDescriptors = modelDescriptors.filter(md => isMissingModel(md, state));
	const expandedMissingDescriptors = expandDescriptors(missingDescriptors, modelGraph);

	// expanding might introduce existing models again
	return expandedMissingDescriptors.filter(md => isMissingModel(md, state));
}

function isMissingModel({ name }: Model.Descriptor, state: object): boolean {
	return ModelSelectors.modelByName(name)(state) === undefined;
}
