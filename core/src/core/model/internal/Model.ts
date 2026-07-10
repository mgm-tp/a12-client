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

import { isModelInstance, type Model as ModelAPI } from "@com.mgmtp.a12.base/base-model-api";
import type { DocumentModel, IGeneratedCodeAccessor } from "@com.mgmtp.a12.kernel/kernel-md-facade";

import { isRecord } from "../../utils.js";

export namespace Model {
	/**
	 * A descriptor for a model.
	 *
	 * This can be used in the application model to specify which kind of
	 * models should be loaded for various scenes.
	 */
	export interface Descriptor<T extends string = string> {
		/** The type of the model. */
		readonly modelType: T;

		/** The name for the descriptor. */
		readonly name: string;

		/**
		 * The name of the document model used for heterogeneity
		 */
		readonly documentModel?: string;

		readonly [key: string]: string | undefined;
	}

	export function isModelDescriptor<T extends string>(
		obj: unknown,
		type?: T
	): obj is Model.Descriptor<T> {
		return (
			isRecord(obj) &&
			(type ? obj.modelType === type : typeof obj.modelType === "string") &&
			typeof obj.name === "string"
		);
	}

	export type ErrorType =
		| "UNKNOWN"
		| "NOT_FOUND"
		| "UNEXPECTED_TYPE"
		| "POST_PROCESSING_FAILED"
		| "NO_SUITABLE_MODEL_LOADER"
		| "UNSUPPORTED_MODEL_VERSION"
		// Workaround to get code completion for string literal union types
		// Taken from: https://github.com/microsoft/TypeScript/issues/29729
		| (string & {});

	/**
	 * Model loading error.
	 */
	export interface Error {
		readonly type: ErrorType;
		readonly message?: string;
		readonly source?: unknown;
	}

	export namespace Error {
		export function isInstance(obj: unknown): obj is Model.Error {
			return (
				isRecord(obj) &&
				typeof obj.type === "string" &&
				(obj.message === undefined || typeof obj.message === "string")
			);
		}
	}

	/**
	 * Determines for a given value if it is a document model.
	 * @param value The value to be checked
	 */
	export function isDocumentModel(value: unknown): value is DocumentModel {
		return isRecord(value) && isModelInstance(value) && value.header.modelType === "document";
	}

	/**
	 * Determines for a given value if it is a document model with generated code.
	 * @param value The value to be checked
	 */
	export function isDocumentAndValidationModel(
		value: unknown
	): value is DocumentAndValidationModel {
		return isDocumentModel(value) && "generatedCodeAccessor" in value;
	}

	/**
	 * In the context of the Client, the document model contains also the
	 * generated code.
	 */
	export interface DocumentAndValidationModel extends DocumentModel {
		/**
		 * This accessor provides access to the generated code from the A12 kernel.
		 * This generated code has been generated from this document model.
		 */
		readonly generatedCodeAccessor: IGeneratedCodeAccessor;
	}

	/**
	 * A binding is a generic mechanism to connect an element of a data context
	 * to a different data contexts. An example for this is the relationship
	 * extension that integrates its own views into a Form-Engine.
	 *
	 * @param T is the type identifier
	 * @param D is the type of the content
	 */
	export interface Binding<T extends string = string, D extends object = object> {
		/** Type of the binding. */
		readonly type: T;
		/** Id of the element that should be bound. */
		readonly elementId: string;
		/**
		 * Details of the binding. Depending on the type of binding here is stated
		 * what should happen and how.
		 */
		readonly details: D;
	}

	export namespace Binding {
		/** Returns true if the given object is {@link Binding} alike. */
		export function isInstance(value: unknown): value is Binding {
			return (
				isRecord(value) &&
				typeof value.type === "string" &&
				typeof value.elementId === "string" &&
				typeof value.details === "object"
			);
		}
	}
}

export type ModelTypeGuard<T extends ModelAPI> = (m: ModelAPI) => m is T;

/**
 * @internal
 */
export function defaultModelTypeGuard<T extends ModelAPI>(_: ModelAPI): _ is T {
	return true;
}
