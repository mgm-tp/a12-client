// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Middleware, Store } from "redux";

import type { Model as ModelAPI } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type { ModelGraph } from "@com.mgmtp.a12.dataservices/dataservices-access/lib/Relationship/ModelGraph.js";

import type { Activity, ActivityMap } from "../../../core/activity/index.js";
import type { DataHandler } from "../../../core/data/internal/DataHandler.js";
import type { ApplicationModel } from "../../../core/model/index.js";
import type { ModelMap } from "../../../core/model/internal/ModelState.js";
import { setupActivityMap } from "../../api/core/activity/util.js";
import type { WaitForFunc } from "../../utils/helpers/waitFor.js";
import { US_LOCALE } from "../../utils/localization.js";
import type { ClientState } from "../../utils/test-utils.js";
import { createApplicationSetup } from "../../utils/test-utils.js";

import { modelListToMap } from "../ModelsUtil.js";

export function createGeneralStore(
	options: {
		readonly applicationModel?: ApplicationModel;
		readonly initialActivity?: ApplicationModel.InitialActivity;
		readonly models?: ModelAPI[];
		readonly modelMap?: ModelMap;
		readonly modelGraph?: Partial<ModelGraph>;
		readonly activityMap?: ActivityMap;
		readonly activities?: Activity[];
		readonly modules?: ReadonlyArray<ApplicationModel.Module>;
		readonly middlewares?: Middleware[];
		readonly dataHandlers?: DataHandler[];
	} = {}
): {
	readonly store: Store<ClientState>;
	readonly waitFor: WaitForFunc;
} {
	const activityMap = options.activityMap ?? setupActivityMap(options.activities ?? []);
	const initialState = {
		activities: activityMap,
		models: {
			applicationModel:
				options.applicationModel ??
				createApplicationModel(options.modules ?? [], options.initialActivity),
			models: options.modelMap ?? modelListToMap(options.models ?? []),
			modelGraph: createModelGraph(options.modelGraph)
		},
		locale: US_LOCALE,
		application: { busy: false, registeredModules: [] },
		notifications: []
	} satisfies ClientState;

	return createApplicationSetup({
		appModel: initialState.models.applicationModel,
		locale: initialState.locale,
		initialState,
		dataHandlers: options.dataHandlers
	});
}

/**
 * Returns an application model with two scenes - one for a form engine
 * and one for an overview-engine
 */
function createApplicationModel(
	modules: ReadonlyArray<ApplicationModel.Module>,
	initialActivity?: ApplicationModel.InitialActivity
): ApplicationModel {
	return {
		header: {
			id: "Minimal_Application_Model",
			modelType: "application",
			modelVersion: "1.0.0",
			locales: [{ code: "en" }]
		},
		content: {
			region: {
				name: "APP",
				layout: { name: "ApplicationFrame" },
				subRegions: []
			},
			defaultRegion: [],
			modules: [
				{
					name: moduleName,
					menu: {
						name: "form-engine-test",
						label: [{ locale: "en", text: "TestModel" }],
						initialActivity: { descriptor: { model: "TestModel" } }
					},
					flows: [
						{
							name: "CRUDFlow1",
							scenes: [
								{
									name: formSceneName,
									matchConditions: [
										{ key: "model", mustEqual: "TestModel" },
										{ key: "instance", isSet: true }
									]
								},
								{
									name: overviewSceneName,
									matchConditions: [
										{ key: "model", mustEqual: "TestModel" },
										{ key: "instance", isSet: false }
									]
								}
							]
						}
					]
				},
				...modules
			],
			initialActivity
		}
	};
}

export const modelName = "TestModel";
export const moduleName = "MyModule";
export const formSceneName = "MySceneForm";
export const overviewSceneName = "MySceneOverview";

export function createModelGraph(modelGraph?: Partial<ModelGraph>): ModelGraph {
	return {
		documentModels: [],
		relationshipModels: [],
		composeDocumentModels: [],
		...modelGraph
	};
}
