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

import type { Action } from "redux";
import type { SagaGenerator } from "typed-redux-saga";

import type { ActivityActions } from "../../activity/internal/actions.js";
import type { Activity } from "../../activity/internal/activity.js";
import type { ActivityMap } from "../../activity/internal/activityMap.js";

export interface DataProvider {
	/**
	 * Name of the data provider. It is useful for debugging purposes.
	 */
	readonly name: string;

	/**
	 * Determines whether the data provider is handling the current data holder of
	 * the current activity. The result of this method can also be dependent on the {@link DataProvider.Operation}
	 * type as well as on the data of other activities in the store.
	 *
	 * @example You can implement this method to return true, only if the current
	 * data holder's descriptor matches { type: "document" } and the current activity
	 * has at least another data holder whose descriptor matches { feature: "mutation" }.
	 *
	 * @returns true, if the data provider handles the current data holder for
	 * the current activity and {@link DataProvider.Operation} type
	 */
	canHandle(config: DataProvider.CanHandleConfig): boolean;

	/**
	 * Performs the data operation for the given list of data holders. This methods gets
	 * all data holders which can be handled by this data provider.
	 *
	 * Since this method is implemented as redux-saga function, it can interact with
	 * the Redux store. In contrast to `DataLoader` or `DataEditor`, this
	 * method is responsible for writing / removing the data to / from the store.
	 *
	 * @example If you want to load document data and put it into one of the activity's data
	 * holder, you have to dispatch a proper action (e.g. ActivityActions.setData) after loading.
	 *
	 */
	provideData(config: DataProvider.ProvideDataConfig): SagaGenerator<void>;
}

/**
 * A general data handler for performing save, delete and load operations for
 * the current activity.The data provider can handle an arbitrary number of
 * {@link Activity.DataHolder}s for one activity.
 *
 * In contrast to `DataLoader` or `DataEditor`, the data provider handles
 * the data persistence with the Redux store by itself. Since it is implemented as a
 * redux saga function, it can dispatch actions or access the store via selectors.
 */
export namespace DataProvider {
	/**
	 * Type of data operation
	 */
	export type Operation = "save" | "delete" | "load";

	/**
	 * The configuration object for the DataProvider's canHandle method.
	 */
	export interface CanHandleConfig {
		/**
		 * Identifier of the activity that requires some data handling
		 */
		readonly activityId: string;

		/**
		 * Type of data operation. You can have different canHandle results
		 * depending on the type of operation.
		 */
		readonly operation: Operation;

		/**
		 * The current data holder that requires some data handling
		 */
		readonly dataHolder: Activity.DataHolder;

		/**
		 * The current activities from the store. This is useful when your
		 * implementation depends on data from other activities.
		 */
		readonly activities: ActivityMap;

		/**
		 * The action that triggered the operation. Can be used to access models of
		 * the current scene from the action's payload.
		 */
		readonly action?: ActivityActions.DataReducerAction;
	}

	/**
	 * The configuration object for the DataProvider's provideData method.
	 */
	export type ProvideDataConfig = LoadConfig | SaveConfig | DeleteConfig;

	/**
	 * The configuration object for provideData when the operation is 'load'
	 */
	export interface LoadConfig {
		/**
		 * Identifier of the activity that performs the data operation.
		 */
		readonly activityId: string;

		/**
		 * The current operation type which will be performed.
		 */
		readonly operation: "load";

		/**
		 * The list of all data holders that are handled by this data provider.
		 */
		readonly dataHolders: Activity.DataHolder[];

		/**
		 * Additional parameter coming from the action's payload triggering the
		 * load data operation.
		 */
		readonly details: LoadDataActionPayload;
	}

	/**
	 * The configuration object for provideData when the operation is 'save'
	 */
	export interface SaveConfig {
		/**
		 * Identifier of the activity that performs the data operation.
		 */
		readonly activityId: string;

		/**
		 * The current operation type which will be performed.
		 */
		readonly operation: "save";

		/**
		 * The list of all data holders that are handled by this data provider.
		 */
		readonly dataHolders: Activity.DataHolder[];

		/**
		 * Additional parameter coming from the action's payload triggering the
		 * save data operation.
		 */
		readonly details: SaveDataActionPayload;
	}

	/**
	 * The configuration object for provideData when the operation is 'delete'
	 */
	export interface DeleteConfig {
		/**
		 * Identifier of the activity that performs the data operation.
		 */
		readonly activityId: string;

		/**
		 * The current operation type which will be performed.
		 */
		readonly operation: "delete";

		/**
		 * The list of all data holders that are handled by this data provider.
		 */
		readonly dataHolders: Activity.DataHolder[];

		/**
		 * Additional parameter coming from the action's payload triggering the
		 * delete data operation.
		 */
		readonly details: DeleteDataActionPayload;
	}

	/**
	 * Additional parameter of the action's payload that triggered
	 * the data loading operation.
	 */
	export interface LoadDataActionPayload extends Omit<
		ActivityActions.LoadDataPayload,
		"activityId"
	> {
		/**
		 * Boolean flag indicating if documents should be pre-computed before
		 * persisting them into the activity's data holder.
		 * If set to false the computation will not be executed.
		 */
		readonly preComputeNewDocuments?: boolean;
	}

	/**
	 * Additional parameter of the action's payload that triggered
	 * the data saving operation.
	 */
	export interface SaveDataActionPayload extends Omit<ActivityActions.CommitPayload, "activityId"> {
		/**
		 * A boolean flag indicating if the activity's data holder should be updated
		 * with the current data after saving has been performed.
		 *
		 * When using a DataEditor, this setting will have no effect.
		 */
		readonly updateActivityData: boolean;

		/**
		 * Action creators which has to be dispatched when the saving operation
		 * has been performed.
		 */
		readonly saving: {
			/** Should be called if the saving was successful. */
			done(result: object): Action;

			/** Should be called if the saving was not successful. */
			failed(error: object): Action;
		};
	}

	/**
	 * Additional parameter of the action's payload that triggered
	 * the data deleting operation.
	 */
	export interface DeleteDataActionPayload extends Omit<
		ActivityActions.RemoveDataPayload,
		"activityId"
	> {
		/**
		 * The current instance id of the data that gets deleted.
		 */
		readonly instanceId: string;
	}
}
