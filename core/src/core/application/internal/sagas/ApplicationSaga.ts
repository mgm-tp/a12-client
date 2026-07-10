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
	 */
	watchDispatchSaga(sagas: ApplicationSaga.Descriptor[]): SagaGenerator<void>;
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
		canHandle(ad: Activity.Descriptor, action: Action): boolean;

		/**
		 * A function to be executed, when the handler applies. Usually implemented as saga
		 *
		 * @param action The dispatched action
		 */
		handle(action: Action): SagaGenerator<void>;
	}
}
