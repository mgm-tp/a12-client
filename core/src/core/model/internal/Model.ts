// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import {
	isModelInstance,
	type Model as ModelAPI
} from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type {
	DocumentModel,
	IGeneratedCodeAccessor
} from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";

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
export function defaultModelTypeGuard<T extends ModelAPI>(_model: ModelAPI): _model is T {
	return true;
}
