// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import {
	isModelInstance,
	type Model as ModelAPI
} from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";

import { isRecord } from "../../utils.js";

import { defaultModelTypeGuard, Model, type ModelTypeGuard } from "./Model.js";

interface Base {
	readonly loadingState: string;
	/**
	 * If set, `model` is directly referenced in the scene,
	 */
	readonly direct?: true;
}

/**
 * @experimental
 * A reference that was not loaded yet.
 *
 * Contains the model descriptor from the scene
 */
export interface NotLoaded extends Base {
	readonly loadingState: "notLoaded";
	readonly model: Model.Descriptor;
}

/**
 *  @experimental
 * A reference that was loaded already.
 *
 * Contains the actual model instance.
 * */
export interface Loaded<T extends ModelAPI = ModelAPI> extends Base {
	readonly loadingState: "loaded";
	readonly model: T;
}

/**
 * @experimental
 * A reference for which loading was already attempted, but failed.
 *
 * Contains the loading error.
 */
export interface Error extends Base {
	readonly loadingState: "error";
	readonly model: Model.Error;
}

/**
 *  @experimental
 *
 * A model reference
 * */
export type Instance = Loaded | NotLoaded | Error;

/** @experimental */
export function isInstance(value: unknown): value is Instance {
	return isRecord(value) && typeof value.loadingState === "string" && value.model !== undefined;
}

/** @experimental */
export function isNotLoaded(value: unknown): value is NotLoaded {
	return (
		isInstance(value) && value.loadingState === "notLoaded" && Model.isModelDescriptor(value.model)
	);
}

/** @experimental */
export function isLoaded<T extends ModelAPI>(
	value: unknown,
	typeGuard: ModelTypeGuard<T> = defaultModelTypeGuard
): value is Loaded<T> {
	return (
		isInstance(value) &&
		value.loadingState === "loaded" &&
		isModelInstance(value.model) &&
		typeGuard(value.model)
	);
}

/** @experimental */
export function isError(value: unknown): value is Error {
	return isInstance(value) && value.loadingState === "error" && Model.Error.isInstance(value.model);
}
