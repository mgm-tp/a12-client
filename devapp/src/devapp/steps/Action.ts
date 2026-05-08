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

import type { StateHistory } from "./factories.js";

export interface Predicate {
	(state: object): boolean;
	description?: string;
}

export type Action<T extends Action.Base = never> =
	| Action.AddValues
	| Action.Cancel
	| Action.Commit
	| Action.Delete
	| Action.NewDocument
	| Action.OpenDocument
	| Action.StartNewTopLevelActivity
	| Action.CancelRequested
	| Action.SetDirty
	| Action.ResponseCancelConfirmationRequired
	| T;

/**
 * Represents an object, which can be used to define an action
 */
export namespace Action {
	/** Default Action */
	export interface Base {
		/** Type of the action */
		readonly type: string;

		/**
		 * Description of the action.
		 * This can later be used to identify what is done.
		 */
		readonly description: string;

		/** Additional predicate to wait for until test can execute */
		readonly actionFinished?: Predicate;

		/**
		 * An optional test, to test if the state is correct after the
		 * execution of an action
		 * @param state the state after an action was executed
		 * @param description the description of the executed action
		 * @param newStateHistoryEntries the new state history entries
		 */
		test?(state: object, description: string, newStateHistoryEntries: StateHistory.Entry[]): void;
	}

	/**
	 * Object to execute an ADD_VALUES_TO_DOC action
	 * This action adds values to an open activity
	 * The values are add to the current activity
	 */
	export interface AddValues extends Base {
		readonly type: "ADD_VALUES_TO_DOC";

		/** Name of the model */
		readonly modelName?: string;

		/** Id of the document
		 * This is optional. If you do not specify an id, the ID for a
		 * new document will be taken
		 */
		readonly documentId?: string;

		/**
		 * The data to add to the activity
		 */
		readonly data: object;

		/**
		 * Whether to mark the dataholder dirty when setting the data
		 */
		readonly dirty?: boolean;
	}

	/**
	 * Object to execute a CANCEL_ACTION
	 */
	export interface Cancel extends Base {
		readonly type: "CANCEL_ACTION";
	}

	/**
	 * Object to execute a COMMIT_ACTION
	 */
	export interface Commit extends Base {
		readonly type: "COMMIT_ACTION";
		readonly shouldSucceed?: boolean;
	}

	/**
	 * Object to execute a DELETE_DOCUMENT action
	 * This action deletes a document from the store.
	 */
	export interface Delete extends Base {
		readonly type: "DELETE_DOCUMENT";

		/** Name of the model for which a document should be deleted */
		readonly modelName: string;

		/** Index of the document in the overview table */
		readonly documentIndex: number;
	}

	/**
	 * Object to execute a NEW_DOCUMENT action
	 * This action opens a new document from a model.
	 */
	export interface NewDocument extends Base {
		readonly type: "NEW_DOCUMENT";

		/** Name of the model for which a new document should be opened */
		readonly modelName: string;
	}

	/**
	 * Object to execute an OPEN_DOCUMENT action
	 * This action opens an existing document from a model.
	 *
	 * ATTENTION: This is just working, if
	 * the main activity from this one should derive is the
	 * current activity in the store
	 * This means you have to do first
	 *  OPEN_MODEL - modelName
	 * and than you can open new or existing documents
	 */
	export interface OpenDocument extends Base {
		readonly type: "OPEN_DOCUMENT";

		/** Name of the parent-model */
		readonly parentModelName: string;

		/** Name of the model of the document */
		readonly documentModelName: string;

		/** Index of the document in the overview */
		readonly documentIndex: number;
	}

	export interface StartNewTopLevelActivity extends Base {
		readonly type: "START_ACTIVITY";
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		readonly descriptor: any;
		readonly child?: boolean;
	}

	export interface CancelRequested extends Base {
		readonly type: "CANCEL_REQUESTED_ACTION";
		readonly vetoDialogExpected: boolean;
	}

	export interface SetDirty extends Base {
		readonly type: "SET_DIRTY";
		readonly dirty: boolean;
	}

	export interface ResponseCancelConfirmationRequired extends Base {
		readonly type: "RESPONSE_CANCEL_CONFIRMATION_REQUIRED";
		readonly veto: boolean;
	}
}
