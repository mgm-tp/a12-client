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
import type { SagaGenerator } from "typed-redux-saga";
import { call, fork, put, select } from "typed-redux-saga";

import type { Model as ModelAPI } from "@com.mgmtp.a12.base/base-model-api";
import type { DocumentModel } from "@com.mgmtp.a12.kernel/kernel-md-facade";

import { ActivityActions } from "../../../activity/internal/actions.js";
import { Activity } from "../../../activity/internal/activity.js";
import { ActivityMap } from "../../../activity/internal/activityMap.js";
import { ActivitySagas } from "../../../activity/internal/sagas.js";
import { ActivitySelectors } from "../../../activity/internal/selectors.js";
import { findDependentActivities } from "../../../activity/internal/utils.js";
import { assertUnreachable } from "../../../assertion.js";
import type {
	DataHandlersLoadResult,
	DataHandlersSaveResult
} from "../../../data/internal/DataHandler.js";
import type { DataLoader } from "../../../data/internal/DataLoader.js";
import type { DataProvider } from "../../../data/internal/DataProvider.js";
import { Model } from "../../../model/internal/Model.js";
import { ModelSagas } from "../../../model/internal/sagas.js";

/** @internal */
export function createDataProviderForDataLoader(dataLoader: DataLoader): DataProvider {
	function loadData(
		activity: Activity,
		modelsPromise: Promise<DataLoader.Models>
	): Promise<DataHandlersLoadResult> {
		return dataLoader.load(activity, modelsPromise).then(data => ({ data }));
	}

	async function saveData(
		descriptor: Activity.Descriptor,
		modelsPromise: Promise<DataLoader.Models>,
		data: object
	): Promise<DataHandlersSaveResult> {
		const { documentModel, modelsInScene } = await modelsPromise;

		return dataLoader
			.save(descriptor, data, documentModel, modelsInScene)
			.then(newData => ({ data: newData }));
	}

	async function deleteData(
		descriptor: Activity.Descriptor,
		modelsPromise: Promise<DataLoader.Models>,
		data: object
	): Promise<void> {
		const { documentModel, modelsInScene } = await modelsPromise;

		return dataLoader.delete(descriptor, data, documentModel, modelsInScene);
	}

	return {
		name: dataLoader.name,
		canHandle({ activityId, dataHolder, operation, activities }) {
			const activity = activities[activityId];

			if (!activity) {
				throw new Error(`Activity with id ${activityId} is not available for the data operation.`);
			}

			switch (operation) {
				case "load":
				case "save":
				case "delete":
					return (
						deepEqual(dataHolder.descriptor, activity.descriptor) &&
						dataLoader.canHandle(dataHolder.descriptor, activities)
					);
				default:
					throw new Error(`Method ${operation} is not supported.`);
			}
		},
		*provideData(config) {
			const { activityId, dataHolders } = config;

			const activity = yield* select(ActivitySelectors.activityById(activityId));
			if (activity === undefined) {
				throw new Error(`No activity found for id ${activityId}.`);
			}

			const defaultDataHolder = dataHolders.find(
				Activity.DataHolder.hasDescriptor(activity.descriptor)
			);
			if (defaultDataHolder === undefined) {
				throw new Error(`No default DataHolder found for activityId ${activityId}`);
			}

			const activities = yield* select(ActivitySelectors.activities());

			const waitForModelsTask = yield* fork(waitForModelsLoaded, activityId, dataLoader);
			const loadedModels = waitForModelsTask.toPromise();

			switch (config.operation) {
				case "load":
					{
						const { data } = yield* call(loadData, activity, loadedModels);
						yield* put(ActivityActions.setData({ activityId, data }));
					}
					break;
				case "save":
					{
						const { updateActivityData, saving } = config.details;

						if (hasDependentActivities(activityId, activities)) {
							yield* put(
								saving.failed({
									error:
										"Dependent activities are still opened! " +
										"Close or commit them before you save or commit this activity!"
								})
							);
							return;
						}

						const { data: oldData, datasourceActivityId } = defaultDataHolder;
						if (oldData === undefined) {
							throw new Error("Cannot handle empty data");
						}

						const { data } = yield* call(saveData, activity.descriptor, loadedModels, oldData);

						let instance: string | undefined;
						if (data !== undefined) {
							if (datasourceActivityId !== undefined) {
								yield* put(
									ActivityActions.setData({
										activityId: datasourceActivityId,
										data
									})
								);
							}

							if (updateActivityData) {
								yield* put(ActivityActions.setData({ activityId, data }));
							}

							if ("document" in data && Activity.Data.Document.isInstance(data.document)) {
								// Update instance after saving document
								instance = data.document.id;
							}
						}

						yield* put(saving.done({ instance }));

						// we need to store the relatedActivityId before, we do the activity's commit
						const relatedActivityId = datasourceActivityId || activity.initiatingActivityId;
						if (relatedActivityId) {
							yield* put(ActivityActions.reloadData({ activityId: relatedActivityId }));
						}
					}
					break;
				case "delete":
					{
						const { instanceId } = config.details;

						const childActivity = yield* select(
							ActivitySelectors.childActivityByInstanceId(activity, instanceId)
						);

						const activityDescriptor = childActivity
							? childActivity.descriptor
							: { ...activity.descriptor, instance: instanceId };

						if (childActivity) {
							yield* put(
								ActivityActions.cancelRequested({
									activityIds: [childActivity.id]
								})
							);
							const cancelled = yield* call(ActivitySagas.waitForResponseCancelRequested);
							if (!cancelled) {
								return;
							}
						}

						if (defaultDataHolder.data === undefined) {
							throw new Error(`Cannot handle empty data"`);
						}

						yield* call(deleteData, activityDescriptor, loadedModels, defaultDataHolder.data);
						yield* put(ActivityActions.reloadData({ activityId: activity.id }));
					}
					break;
				default:
					// when introducing a new type this method will cause a compile error
					assertUnreachable(config);
			}
		}
	};
}

function hasDependentActivities(id: string, activities: ActivityMap): boolean {
	const dependentActivities = ActivityMap.toList(findDependentActivities(activities, id)).map(
		dependentActivity => dependentActivity.id
	);
	return dependentActivities.length > 0;
}

function* waitForModelsLoaded(
	activityId: string,
	dataLoader: DataLoader
): SagaGenerator<DataLoader.Models> {
	const activity = yield* select(ActivitySelectors.activityById(activityId));
	if (activity === undefined) {
		throw new Error(`No activity found for id ${activityId}.`);
	}

	const models = yield* call(() => ModelSagas.waitForModelsLoaded(activityId));

	const activities = yield* select(ActivitySelectors.activities());
	const useActivityDescriptorModel =
		dataLoader.useActivityDescriptorModel?.(activity.descriptor, activities) ?? true;

	const documentModel =
		findDocumentModelFromActivityDescriptor(activity, useActivityDescriptorModel, models) ??
		findDocumentModelInModels(models);

	return { documentModel, modelsInScene: models };
}

function findDocumentModelFromActivityDescriptor(
	activity: Activity,
	useActivityDescriptorModel: boolean,
	models?: ModelAPI[]
): DocumentModel | undefined {
	return useActivityDescriptorModel && models
		? models
				.filter(Model.isDocumentModel)
				.find(model => model.header.id === activity.descriptor.model)
		: undefined;
}

function findDocumentModelInModels(models: ModelAPI[] = []): DocumentModel | undefined {
	for (const model of models) {
		if (Model.isDocumentModel(model)) {
			continue;
		}

		const modelReference = model.header.modelReferences?.find(
			({ modelType }) => modelType === "document"
		);

		if (modelReference) {
			return models.find((m): m is DocumentModel => m.header.id === modelReference.reference);
		}
	}

	return undefined;
}
