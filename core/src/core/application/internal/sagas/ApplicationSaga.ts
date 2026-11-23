// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { AnyAction } from "redux";
// TODO: A12C-3195, SagaIterator to SagaGenerator
// oxlint-disable-next-line no-restricted-imports
import type { SagaIterator } from "redux-saga";

import type { Activity } from "../../../activity/index.js";
import type { DataHandler } from "../../../data/internal/DataHandler.js";

export interface ApplicationSaga {
	/**
	 * The dispatch watcher saga of the application, watching for every dispatched action and delegating the
	 * execution to a matching handler
	 *
	 * @param sagas
	 * An array of Descriptors of handlers (usually implemented as sagas),
	 * to which the executing might be delegated
	 *
	 * @returns A SagaIterator
	 */
	watchDispatchSaga(sagas: ApplicationSaga.Descriptor[]): SagaIterator<void>;
}

/**
 * Provides functionality used in connection with the asynchronous handlers
 */
export namespace ApplicationSaga {
	/**
	 * Configuration for handlers
	 */
	export interface Configuration {
		/**
		 * {@link DataHandler[]}, that might be required for a handler working with the application business data
		 */
		readonly dataHandlers: DataHandler[];

		/**
		 * Boolean that specifies if the computation of new documents should be executed when creating them.
		 * If set to false, the computation is not executed.
		 * Otherwise the computation is executed and the updated document is put back into the store
		 */
		readonly preComputeNewDocuments?: boolean;
	}

	/**
	 * A descriptor of an asynchronous handler, that helps determining, if and how the handler should
	 * handle an action dispatched for an activity
	 */
	export interface Descriptor {
		/**
		 * A function to determine if the handler is responsible
		 * @param ad The {@link Activity.Descriptor} of an activity
		 * @param action The dispatched action
		 *
		 * @returns true, if the handler is responsible for the combination of activity and action, and false if not
		 */
		canHandle(ad: Activity.Descriptor, action: AnyAction): boolean;

		/**
		 * A function to be executed, when the handler applies. Usually implemented as saga
		 *
		 * @param action The dispatched action
		 *
		 * @returns A SagaIterator
		 */
		handle(action: AnyAction): SagaIterator<void>;
	}
}
