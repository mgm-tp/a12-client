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

import deepEqual from "fast-deep-equal";

import { isRecord } from "../../utils.js";

/**
 * The activity is a data structure that holds all relevant data and states.
 * Besides, it provides the UI component for interacting with the data.
 */
export interface Activity {
	/**
	 * Unique identifier for the activity.
	 */
	readonly id: string;

	/**
	 * It denotes the timestamp when the activity is created. A newly created activity is always
	 * the latest activity in the store, i.e. has the latest activation timestamp.
	 */
	readonly activationTimestamp: number;

	/**
	 * It specifies what the activity is doing, e.g. the type of use case and details like the ID of the
	 * business object.
	 *
	 * The idea is to separate the intention, i.e. "What should be done?" from the interpretation and implementation
	 * of "How should it be done?". The "what" is the activity descriptor and it is the responsibility of the
	 * activity creator to specify it. The "how" is specified by the state matches in the application model.
	 */
	readonly descriptor: Activity.Descriptor;

	/**
	 * A list of data holder objects. Each of them stores data from one data source.
	 *
	 * One data holder gets automatically initialized by the runtime when an ActivityActions.push action is
	 * dispatched. Its descriptor is the same as the activity's descriptor. Therefore, we also refer to it as
	 * the activity data holder. Its data is typically used for the UI engines.
	 *
	 * Each data holder also keeps track of its data. It has additional properties like loading/saving state, busy and
	 * error. Each data holder has its own descriptor which is used by the runtime to identify suitable data handler
	 * for each data holder.
	 */
	readonly dataHolders: Activity.DataHolder[];

	/**
	 * A reference to a potential parent activity.
	 *
	 * Activities can be top-level activities, i.e. they have no parent activity and thus the initiatingActivityId
	 * is not defined.
	 *
	 * Besides, activities can be nested within each other. Then this property is the reference to the parent
	 * activity, if this activity is not a top-level activity.
	 *
	 * @example A selection in an overview master creates a form detail activity.
	 */
	readonly initiatingActivityId?: string;

	/**
	 * Reference to a case inside an application model scene.
	 */
	readonly case?: string;

	/**
	 * This property describes the current lock state of the activity. When it is set, the activity is seen as
	 * locked, otherwise it is seen as unlocked (lock property is undefined).
	 *
	 * @example This can be used to prevent changes on the activity's data when it gets saved in the back-end.
	 */
	readonly lock?: Activity.Lock;

	/**
	 * Tracks if a cancel has to be confirmed.
	 */
	readonly cancelConfirmationRequired?: boolean;
}

export namespace Activity {
	/**
	 * The error object to describe any kind of failure during activity related operations.
	 * The type of error can be one of the predefined ones or any kind of error that extends the {@link Error.Base} type.
	 */
	export type Error<T extends Error.Base = never> =
		| Error.InternalClient
		| Error.Validation
		| Error.PageNotFound
		| Error.Saving
		| T;

	export namespace Error {
		/**
		 * The base type of an error for any activity related operation.
		 */
		export interface Base {
			/**
			 * String representing the error code. Used to identify an arbitrary error object as
			 * {@link Activity.Error}.
			 */
			readonly errorCode: string;
		}

		/**
		 * Function to check whether a given error object is of type {@link Activity.Error}.
		 *
		 * @param error Any object whose instance is to be determined.
		 * @returns Returns true if the given error object is of type {@link Activity.Error}, false otherwise.
		 */
		export function isInstance<T extends Error.Base = never>(error: unknown): error is Error<T> {
			return isRecord(error) && typeof error.errorCode === "string";
		}

		/**
		 * Error object representing as an internal client error.
		 */
		export interface InternalClient extends Base {
			/**
			 * Error code to identify this error object as internal client error.
			 */
			readonly errorCode: "INTERNAL_CLIENT_ERROR";

			/**
			 * The string provides additional information about the error.
			 */
			readonly message?: string;
		}

		/**
		 * Error object representing a validation error reported from the A12 validation kernel.
		 */
		export interface Validation extends Base {
			/**
			 * Error code to identify this error object as a validation error.
			 */
			readonly errorCode: "VALIDATION_ERROR";

			/**
			 * Object provides all information from the A12 validation kernel about the validation errors.
			 */
			readonly validationMessages: {}; // TODO: Make type more precise
		}

		/**
		 * Error object representing a page-not-found error.
		 */
		export interface PageNotFound extends Http {
			/**
			 * Error code to identify this error object as a page-not-found error.
			 */
			readonly errorCode: "PAGE_NOT_FOUND_ERROR";

			/**
			 * String representing the requested page causing this error.
			 */
			readonly page: string;
		}

		/**
		 * Error object representing a saving-failed error.
		 */
		export interface Saving extends Base {
			/**
			 * Error code to identify this error object as a saving-failed error.
			 */
			readonly errorCode: "SAVING_FAILED_ERROR";

			readonly content: object;
		}

		/**
		 * Error object representing a http error.
		 */
		export interface Http extends Base {
			/**
			 * The object provides information about the http response from the server.
			 */
			readonly httpResponseDetails?: HttpResponseInfo;
		}

		/**
		 * A container that contains http response information from a server request. It is used in http related
		 * {@link Activity.Error}s.
		 */
		export interface HttpResponseInfo {
			/**
			 * Http status code of the response object.
			 */
			readonly status: number;

			/**
			 * Headers object from the server response object.
			 */
			readonly headers: Headers;

			/**
			 * String representing the url of the response object.
			 */
			readonly url: string;

			/**
			 * The response object's payload containing additional information for the response.
			 */
			readonly payload?: {}; // TODO: Make type more precise
		}
	}

	/**
	 * The loading state tracks the activity related data loading and gives information about the outcome. The
	 * following types can be assigned:
	 *
	 * * _without_: the activity does not require any data, and the data property is undefined
	 * * _missing_: the activity requires data. The Client runtime has to load it.
	 * Until the data is loaded, the data property is undefined.
	 * * _loading_: the Client runtime is currently loading the data
	 * * _loaded_: the loading of data has been successful
	 * * _error_: there has been at least one error during loading the data
	 */
	export type LoadingState = "without" | "missing" | "loading" | "loaded" | "error";
	export namespace LoadingState {
		/**
		 * Object representing the {@link LoadingState} and a potential {@link Error} object.
		 */
		export interface Details {
			readonly state: Activity.LoadingState;
			readonly error?: Error;
		}
	}

	/**
	 * The saving state tracks the activity related saving of data and gives information about the outcome. The
	 * following types can be assigned:
	 *
	 * * _not saved_: the activity has not been saved, the data property might be set or undefined
	 * * _saving_: the Client runtime is currently saving the data
	 * * _saved_: the saving of data has been successful
	 * * _error_: there has been at least one error while saving the data
	 */
	export type SavingState = "not_saved" | "saving" | "saved" | "error";
	export namespace SavingState {
		/**
		 * Object representing the {@link SavingState} and a potential {@link Error} object.
		 */
		export interface Details {
			readonly state: Activity.SavingState;
			readonly error?: Error;
		}
	}

	/**
	 * A key/value map that specifies _what_ the {@link Activity} is doing. The instance key is
	 * pre-defined. It means that the Client provides I/O (loading/saving) and UI components that interprets them in
	 * a specific way. More details can be found in the Client architecture documentation.
	 *
	 * @example An example of a activity descriptor is the type of use case and details like the ID of the
	 * business object.
	 */
	export interface Descriptor {
		/**
		 * Underlying type of data in Activity. By default, model is interpreted as the ID of an A12 Document Model.
		 */
		// Important: All usages that interpret it as an A12 model must provide a way to disable that interpretation
		// except in contexts that already rely on A12 models/documents
		readonly model?: string;

		/**
		 * Specifies the ID of a business object, or in A12 context, a reference to an A12 data document.
		 */
		readonly instance?: string;

		/**
		 * Additional key/value-pairs to specify _what_ the activity is doing.
		 */
		readonly [key: string]: string | undefined;
	}

	export namespace Descriptor {
		/**
		 * @internal
		 */
		export function equal(d1: Descriptor, d2: Descriptor): boolean {
			const k1 = Object.keys(d1);
			const k2 = Object.keys(d2);
			return k1.length === k2.length && k1.every(p1 => d1[p1] === d2[p1]);
		}
	}

	/**
	 * Provides lock information for activities
	 */
	export interface Lock {
		/**
		 * An identifier of the lock
		 */
		readonly id: string;

		/**
		 * A string denoting the current owner of the lock.
		 */
		readonly owner: string;

		/**
		 * Additional details about the lock
		 */
		readonly details: {};
	}

	/**
	 * A container for predefined types for the activity's data. It contains a
	 * specification for overview (list of documents) and document data.
	 */
	export namespace Data {
		/**
		 * Specification for the A12 document content
		 */
		export interface Document {
			readonly id: string;

			readonly modelId: string;

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			readonly [key: string]: any;
		}

		export namespace Document {
			export function isInstance(value: unknown): value is Document {
				return isRecord(value) && typeof value.id === "string" && typeof value.modelId === "string";
			}
		}
	}

	/**
	 * Returns the default {@link DataHolder} of the given activity.
	 *
	 * Note that for convenience reasons it is acceptable that activity is undefined.
	 */
	export function findDefaultDataHolder(
		activity: Activity | undefined
	): Activity.DataHolder | undefined {
		return activity?.dataHolders.find(Activity.DataHolder.hasDescriptor(activity.descriptor));
	}

	export interface DataHolder<T = {}> {
		/**
		 * It specifies what kind of data is stored within the data holder. It
		 * also serves to identify certain data holders.
		 */
		readonly descriptor: DataHolderDescriptor;

		/**
		 * It stores data that is typically used for the UI engines.
		 *
		 * The default scenario for passing data to this data holder is by delegating it to specific data handlers. It is
		 * not required to set this data property within its data holder while the activity is created.
		 *
		 * @example The data for an overview engine could be the list of search
		 * results. The data for a form engine could be the document data for the business object.
		 *
		 */
		readonly data?: T;

		/**
		 * Used to extend the data holder's data structure by additional key/value-pairs.
		 *
		 * @example An data holder that provides data for the overview engine typically provides additional information
		 * about the pagination and filtering. These can be stored here.
		 *
		 */
		readonly slices: { [key: string]: {} | undefined };

		/**
		 * The error object indicates any failure that may happen while data holder related data gets loaded or saved.
		 * Besides, it provides the type of error and, depending on the type, additional information.
		 */
		readonly error?: Activity.Error;

		// FIXME: combine these three properties into one
		/**
		 * It represents the dirty state of the data holder.
		 *
		 * Typically the data holder is marked as dirty whenever its data has changed and this data has no yet
		 * been synchronized back into the persistance layer.
		 */
		readonly dirty: boolean;

		/**
		 * It tracks the progress and gives information about the loading state of data holder related data.
		 */
		readonly loadingState: Activity.LoadingState;

		/**
		 * It tracks the progress and gives information about the staving state of data holder related data.
		 */
		readonly savingState: Activity.SavingState;

		// FIXME: we should get rid of this property, since it can be derived
		/**
		 * An indicator to display a progress bar when the data holder is busy.
		 */
		readonly busy?: boolean;

		// FIXME: we should get rid of this property, since it can be derived
		/**
		 * A reference to an activity which provides potential data for this data holder. This source activity is either
		 * the direct parent of the data holder's activity or any parent above it.
		 *
		 * Note that if the data comes from somewhere else, this datasourceActivityId is not set.
		 */
		readonly datasourceActivityId?: string;
	}

	/**
	 * A data holder is responsible for one data source and has its own data descriptor.
	 * The data descriptor is used to identify a matching data handler. The data holder
	 * also keeps track of its data.
	 */
	export namespace DataHolder {
		/**
		 * Utility function to compare a data holder's descriptor for a given descriptor.
		 * It is in particular useful for iterating over data holder arrays, e.g.
		 * find and filter methods of arrays
		 *
		 * @returns A function that evaluates to true, when the given data holder's
		 * descriptor is equal to the given descriptor.
		 *
		 * @example const productDataHolder = dataHolders.find(hasDescriptor({ feature: "product" }));
		 */
		export function hasDescriptor(
			descriptor: Activity.DataHolderDescriptor | Activity.Descriptor
		): (dataHolder: Activity.DataHolder) => boolean {
			return dataHolder => deepEqual(descriptor, dataHolder.descriptor);
		}

		/**
		 * Utility function to compare a data holder's descriptor for a given descriptor.
		 * It is in particular useful for iterating over data holder arrays, e.g.
		 * find and filter methods of arrays
		 *
		 * @returns A function that evaluates to true, when the given data holder's
		 * descriptor is not equal to the given descriptor.
		 *
		 * @example const allOtherDataHolders = dataHolders.filter(hasNotDescriptor({ feature: "product" }));
		 */
		export function hasNotDescriptor(
			descriptor: Activity.DataHolderDescriptor | Activity.Descriptor
		): (dataHolder: Activity.DataHolder) => boolean {
			return dataHolder => !deepEqual(descriptor, dataHolder.descriptor);
		}
	}

	/**
	 * An object specifying what kind of data the data holder is storing. The descriptor is also used by data handlers
	 * to identify specific data holders.
	 */
	export interface DataHolderDescriptor {
		/**
		 * Additional key/value-pairs to specify _what_ kind of data the data holder is storing.
		 */
		readonly [key: string]: string | undefined;
	}
}
