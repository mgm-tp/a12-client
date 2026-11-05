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

import type { SagaGenerator } from "typed-redux-saga";
import { all, call, put, select, take, takeEvery } from "typed-redux-saga";

import type { ModelGraph } from "@com.mgmtp.a12.dataservices/dataservices-access";
import { LoggerFactory } from "@com.mgmtp.a12.utils/utils-logging";

import { ModelActions } from "../../../model/internal/actions.js";
import { ApplicationModel } from "../../../model/internal/ApplicationModel.js";

import type { Module } from "../factories/module.js";
import { ModuleRegistryProvider } from "../factories/moduleRegistryProvider.js";

const logger = LoggerFactory.getLogger("core/application");

/**
 * @experimental
 *
 * Module that, when registered, loads all statically available application models
 * and makes them available via the Module API.
 *
 * When using this, the model property in the Client appsetup is obsolete and can be filled
 * with any valid appmodel. For convenience, Client provides the constant `APPLICATION_MODEL_PLACEHOLDER` as a placeholder.
 *
 * NOTE: Requires a modelgraph
 */
export const AppModelAdapterModule: Module = {
	id: "appModelAdapterModule",
	sagas: () => [registerAppModelsSaga]
};

/**
 * NOTE: the way we turn the appmodel into a Module here might change when we
 * move from appmodels to runtime configuration
 */
function createAdapterModule(appModel: ApplicationModel): Module {
	return {
		id: appModel.header.id,
		model: () => appModel
	};
}

/**
 * On every `setModelGraph` action, finds all application models
 * that need to be loaded, loads them and makes the available as a module
 */
function* registerAppModelsSaga(): SagaGenerator<void> {
	yield* takeEvery(ModelActions.setModelGraph, function* ({ payload }) {
		return yield* call(registerAppModels, payload.genericModels);
	});
}

/**
 * @internal
 * export for tests
 */
export function* registerAppModels(otherModels?: ModelGraph.OtherModel[]): SagaGenerator<void> {
	const moduleRegistry = ModuleRegistryProvider.getInstance();

	const referencedAppModelIds = otherModels
		?.filter(m => m.type === "application")
		.map(m => m.modelId);

	const existingModules = moduleRegistry.getAllModules();
	const existingModuleIds = existingModules.map(m => m.id);

	// find appmodels which were already registered by the adapter
	const state = yield* select();
	const existingAppModelsFromModules = existingModules.flatMap(mod =>
		referencedAppModelIds?.includes(mod.id) ? (mod.model?.(state) ?? []) : []
	);

	// make them available by merging them into the state
	if (existingAppModelsFromModules.length) {
		yield* put(ModelActions.addModulesApplicationModels({ models: existingAppModelsFromModules }));
	}

	// find appmodels which need to be registered by the adapter
	const requiredAppModelIds = referencedAppModelIds?.filter(id => !existingModuleIds.includes(id));
	if (requiredAppModelIds?.length) {
		const loadedAppModels = yield* call(loadAppModels, requiredAppModelIds);

		// make them available by registering modules for each
		const addModuleEffects = loadedAppModels.map(appmodel =>
			call(() => moduleRegistry.addModule(createAdapterModule(appmodel)))
		);
		yield* all(addModuleEffects);
	}
}

/**
 * Loads a list of appmodels specified by their ids by triggering the configured ModelLoader
 *
 * NOTE: requests can not fail because of missing rights because the ids are collected
 * from the modelgraph, which only contains models that are visible for the user
 */
function* loadAppModels(modelIds: string[]): SagaGenerator<ApplicationModel[]> {
	try {
		yield* put(
			ModelActions.loadModels(modelIds.map(id => ({ modelType: "application", name: id })))
		);

		const { payload } = yield* take(ModelActions.setModels);

		const models = Object.values(payload).filter(ApplicationModel.isInstance);

		if (models.length < modelIds.length) {
			throw new Error("At least one application model failed to load!");
		}

		return models;
	} catch (error) {
		logger.error(error);
		logger.error(`Failed to load application models [${modelIds.join(",")}]`);
		return [];
	}
}
