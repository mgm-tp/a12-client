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

import type { Model as ModelAPI } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type { DocumentModel } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

import type { Activity } from "../../activity/internal/activity.js";
import type { ActivityMap } from "../../activity/internal/activityMap.js";
import { ApplicationModel } from "../../model/internal/ApplicationModel.js";

/**
 * A general loader for loading data of a user defined type
 *
 * @param DataType The user defined type of the data
 */
export interface DataLoader<T = object> {
	/**
	 * A unique name to identify the loader
	 */
	readonly name: string;

	/**
	 * Determines, if the loader is responsible for an activity
	 *
	 * @param activityDescriptor
	 * A {@link Activity.Descriptor} to identify an {@link Activity}, for which is checked, if the loader applies
	 * @param parents
	 * An optional {@link ActivityMap} of activities connected to the given activity, that might be required to
	 *     determine the responsibility, when the descriptor doesn't provide enough information
	 *
	 * @returns true, if the loader is determined responsible or false if not
	 */
	canHandle(activityDescriptor: Activity.Descriptor, parents?: ActivityMap): boolean;

	/**
	 * Loads the data of the user defined type
	 *
	 * @param activity The activity expecting the data
	 * @param models a promise which when resolved provides the documentModel and a list of all models in the scene.
	 * It is recommended to await the promise after the data loading request in order to achieve parallel data and model loading.
	 * Awaiting the promise before the data loading request would block the data loading while waiting for the model loading to finish.
	 *
	 * @returns A promise eventually resolving to the requested data
	 */
	load(activity: Activity, models: Promise<DataLoader.Models>): Promise<T>;

	/**
	 * Saves data of an activity
	 *
	 * @param activityDescriptor
	 * The {@link Activity.Descriptor} to identify the {@link Activity}, for which the data should be saved
	 * @param data The data to be saved
	 * @param documentModel If the data loader is used in combination with A12 models,
	 * the optional DocumentModel, for which data is saved
	 * @param modelsInScene that are referenced in the scene
	 *
	 * @returns A promise eventually resolving to a save result object, when the data was saved
	 */
	save(
		activityDescriptor: Activity.Descriptor,
		data: T,
		documentModel: DocumentModel | undefined,
		modelsInScene: ModelAPI[]
	): Promise<T>;

	/**
	 * Deletes data of an activity
	 *
	 * @param activityDescriptor
	 * The {@link Activity.Descriptor} to identify the {@link Activity}, for which the data should be deleted
	 * @param data The data to be deleted
	 * @param documentModel If the data loader is used in combination with A12 models,
	 * the optional DocumentModel, for which data is deleted
	 * @param modelsInScene that are referenced in the scene
	 *
	 * @returns A promise eventually resolving, when the data was deleted
	 */
	delete(
		activityDescriptor: Activity.Descriptor,
		data: T,
		documentModel: DocumentModel | undefined,
		modelsInScene: ModelAPI[]
	): Promise<void>;

	/**
	 * Data Loaders for A12 Document need the Document Model for (un)marshalling purposes, and Client takes care of
	 * loading and providing it to the Data Loader.
	 *
	 * By default, the "model" property of the Activity Descriptor is used to determine the Document Model.
	 *
	 * If you want to disable this behavior for some cases, you can implement useActivityDescriptorModel and return
	 * false in those cases.
	 *
	 * In both cases, a Document Model present in the current scope will be used as a fallback.
	 */
	useActivityDescriptorModel?(
		activityDescriptor: Activity.Descriptor,
		allActivities?: ActivityMap
	): boolean;
}

export namespace DataLoader {
	/**
	 * Meta data to determine, if a {@link DataLoader} is responsible for an {@link Activity}
	 */
	export interface Meta {
		/**
		 * The unique name of the DataLoader
		 */
		readonly name: string;

		/**
		 * An array of {@link ApplicationModel.MatchCondition}s, which is used to determine
		 * if the DataLoader is responsible for an activity
		 */
		readonly matchConditions: ApplicationModel.MatchCondition[];
	}

	/**
	 * Models to be used for data loading
	 */
	export interface Models {
		/**
		 * Can be undefined when the scene definition does not require a document model
		 */
		readonly documentModel: DocumentModel | undefined;
		/**
		 * An array of all models referenced in the scene.
		 */
		readonly modelsInScene: ModelAPI[];
	}

	/**
	 * Determines, if a {@link DataLoader} is responsible for an {@link Activity} by checking, if all
	 * {@link ApplicationModel.MatchCondition}s of the given {@link Meta} data fit to the given activityDescriptor
	 *
	 * @param meta The meta data of the DataLoader
	 * @param activityDescriptor
	 * The {@link Activity.Descriptor} of an {@link Activity}, for which the responsibility of the DataLoader is checked
	 *
	 * @returns true, if the DataLoader is determined responsible or false if not
	 */
	export function canHandle(
		meta: DataLoader.Meta,
		activityDescriptor: Activity.Descriptor
	): boolean {
		return meta.matchConditions.every(state =>
			ApplicationModel.MatchCondition.evaluate(state, activityDescriptor)
		);
	}
}
