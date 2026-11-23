// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { SagaGenerator } from "typed-redux-saga";
import { all, call, put, select, take, takeEvery } from "typed-redux-saga";

import type { ModelGraph } from "@com.mgmtp.a12.dataservices/dataservices-access/lib/Relationship/ModelGraph.js";
import { LoggerFactory } from "@com.mgmtp.a12.utils/utils-logging/lib/factory.js";

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
