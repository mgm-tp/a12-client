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

import { deepStrictEqual, strictEqual } from "node:assert/strict";
import { mock } from "node:test";

import { expectSaga } from "redux-saga-test-plan";

import type { Model as ModelAPI } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import type { ModelGraph } from "@com.mgmtp.a12.dataservices/dataservices-access/lib/Relationship/ModelGraph.js";
import { LoggerFactory } from "@com.mgmtp.a12.utils/utils-logging/lib/factory.js";

import {
	ModuleRegistryProvider,
	type ModuleRegistry
} from "../../../../../../core/application/index.js";
import { registerAppModels } from "../../../../../../core/application/internal/adapter/appModelAdapterModule.js";
import type { ApplicationModel, Model, ModelMap } from "../../../../../../core/model/index.js";
import { ModelActions } from "../../../../../../core/model/index.js";
import type { Writeable } from "../../../../../../core/utils.js";

describe("core.application", () => {
	describe("adapter.registerAppModels", () => {
		function setupRegistry() {
			const mockRegistry = {
				getAllModules: mock.fn(),
				addModule: mock.fn(),
				removeModule: mock.fn(),
				removeModuleById: mock.fn()
			} satisfies ModuleRegistry;

			mock.method(ModuleRegistryProvider, "getInstance", () => mockRegistry);

			return mockRegistry;
		}

		it("does nothing if there are no application models", async () => {
			const mockRegistry = setupRegistry();
			const uiModels: ModelGraph.OtherModel[] = [
				{
					modelId: "O1",
					modelReferences: [],
					type: "overview"
				},
				{
					modelId: "F1",
					modelReferences: [],
					type: "form"
				}
			];
			mockRegistry.getAllModules.mock.mockImplementationOnce(() => []);

			const { effects } = await expectSaga(registerAppModels, uiModels).silentRun();

			strictEqual(effects.put, undefined);
			strictEqual(mockRegistry.addModule.mock.callCount(), 0);
		});

		it("adds all application models as modules if they are not registered yet", async () => {
			const mockRegistry = setupRegistry();
			const uiModels: ModelGraph.OtherModel[] = [
				{
					modelId: "A1",
					modelReferences: [],
					type: "application"
				},
				{
					modelId: "O1",
					modelReferences: [],
					type: "overview"
				},
				{
					modelId: "A2",
					modelReferences: [],
					type: "application"
				},
				{
					modelId: "F1",
					modelReferences: [],
					type: "form"
				},
				{
					modelId: "A3",
					modelReferences: [],
					type: "application"
				}
			];

			mockRegistry.getAllModules.mock.mockImplementationOnce(() => []);

			const appModels = uiModels.filter(m => m.type === "application");
			const modelMap = appModels.reduce((acc, cur) => {
				acc[cur.modelId] = mockAppModel(cur.modelId);
				return acc;
			}, {} as Writeable<ModelMap>);

			await expectSaga(registerAppModels, uiModels)
				.put(
					ModelActions.loadModels(appModels.map(am => ({ modelType: am.type, name: am.modelId })))
				)
				.dispatch(ModelActions.setModels(modelMap))
				.silentRun();

			strictEqual(mockRegistry.getAllModules.mock.callCount(), 1);

			strictEqual(mockRegistry.addModule.mock.callCount(), appModels.length);

			appModels.forEach((m, idx) => {
				const args = mockRegistry.addModule.mock.calls[idx].arguments;

				strictEqual(args[0].id, m.modelId);
				deepStrictEqual(args[0].model?.({}), mockAppModel(m.modelId));
			});
		});

		it("only logs an error if at least one application model failed to load", async () => {
			const mockRegistry = setupRegistry();
			const logger = LoggerFactory.getLogger("core/application");

			const errorLog = mock.method(logger, "error");

			const appModels: ModelGraph.OtherModel[] = [
				{
					modelId: "A1",
					modelReferences: [],
					type: "application"
				},
				{
					modelId: "A2",
					modelReferences: [],
					type: "application"
				}
			];

			mockRegistry.getAllModules.mock.mockImplementationOnce(() => []);

			const modelMap: ModelMap = {
				A1: mockAppModel("A1"),
				A2: mockErr("A2 failed to load")
			};

			await expectSaga(registerAppModels, appModels)
				.dispatch(ModelActions.setModels(modelMap))
				.silentRun();

			strictEqual(mockRegistry.addModule.mock.callCount(), 0);
			strictEqual(errorLog.mock.callCount() > 0, true);
		});

		it("does not add application models as modules if they are already registered and merges them instead", async () => {
			const mockRegistry = setupRegistry();
			const uiModels: ModelGraph.OtherModel[] = [
				{
					modelId: "A1",
					modelReferences: [],
					type: "application"
				},
				{
					modelId: "A2",
					modelReferences: [],
					type: "application"
				},
				{
					modelId: "A3",
					modelReferences: [],
					type: "application"
				}
			];

			mockRegistry.getAllModules.mock.mockImplementationOnce(() => [
				{ id: "A1", model: () => mockAppModel("A1") },
				{ id: "A3", model: () => mockAppModel("A3") }
			]);

			const expectedAction = ModelActions.addModulesApplicationModels({
				models: [mockAppModel("A1"), mockAppModel("A3")]
			});

			await expectSaga(registerAppModels, uiModels)
				.put(ModelActions.loadModels([{ modelType: "application", name: "A2" }]))
				.dispatch(ModelActions.setModels({ A2: mockAppModel("A2") }))
				.put(expectedAction)
				.silentRun();

			strictEqual(mockRegistry.addModule.mock.callCount(), 1);

			const args = mockRegistry.addModule.mock.calls[0].arguments;

			strictEqual(args[0].id, "A2");
			deepStrictEqual(args[0].model?.({}), mockAppModel("A2"));
		});

		it("ignores modelReferences of loaded application models", async () => {
			const mockRegistry = setupRegistry();
			const uiModels: ModelGraph.OtherModel[] = [
				{
					modelId: "A1",
					modelReferences: [
						{ modelType: "masterdetail", reference: "MDM1" },
						{ modelType: "masterdetail", reference: "MDM2" }
					],
					type: "application"
				},
				{
					modelId: "A2",
					modelReferences: [{ modelType: "masterdetail", reference: "MDM3" }],
					type: "application"
				},
				{
					modelId: "MDM1",
					modelReferences: [],
					type: "masterdetail"
				},
				{
					modelId: "MDM2",
					modelReferences: [],
					type: "masterdetail"
				},
				{
					modelId: "MDM3",
					modelReferences: [],
					type: "masterdetail"
				}
			];

			mockRegistry.getAllModules.mock.mockImplementationOnce(() => []);

			const appModels = uiModels.filter(m => m.type === "application");
			const modelMap = uiModels.reduce((acc, cur) => {
				acc[cur.modelId] = mockModel(cur);
				return acc;
			}, {} as Writeable<ModelMap>);

			await expectSaga(registerAppModels, uiModels)
				.put(
					ModelActions.loadModels(appModels.map(am => ({ modelType: am.type, name: am.modelId })))
				)
				.dispatch(ModelActions.setModels(modelMap))
				.silentRun();

			strictEqual(mockRegistry.getAllModules.mock.callCount(), 1);

			strictEqual(mockRegistry.addModule.mock.callCount(), appModels.length);

			appModels.forEach((m, idx) => {
				const args = mockRegistry.addModule.mock.calls[idx].arguments;

				strictEqual(args[0].id, m.modelId);
				deepStrictEqual(args[0].model?.({}), mockAppModel(m.modelId));
			});
		});
	});
});

function mockModel({ modelId, type }: ModelGraph.OtherModel): ModelAPI {
	return type === "application"
		? mockAppModel(modelId)
		: {
				header: { id: modelId, modelType: type, modelVersion: "1.0.0" },
				content: {}
			};
}

function mockAppModel(id: string = "mock"): ApplicationModel {
	return {
		header: { id, modelType: "application", modelVersion: "6.0.0" },
		content: {
			region: {
				name: `region${id}`,
				layout: { name: `layout${id}` }
			},
			modules: [],
			defaultRegion: []
		}
	};
}

function mockErr(message?: string): Model.Error {
	return {
		type: "UNKNOWN",
		message
	};
}
