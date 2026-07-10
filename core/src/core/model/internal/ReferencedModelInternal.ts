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
