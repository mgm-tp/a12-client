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

import { strictEqual, throws } from "node:assert/strict";
import { mock, type Mock } from "node:test";

import type { AnyAction, Middleware } from "redux";
import { take } from "redux-saga/effects";
import type { SagaGenerator } from "typed-redux-saga";

import { ActivityActions } from "../../../../core/activity/index.js";
import type { ApplicationSetup, Module, ReducerMap } from "../../../../core/application/index.js";
import {
	ApplicationFactories,
	ModuleRegistryProvider,
	ModuleTestExtensions
} from "../../../../core/application/index.js";
import type { ModuleRegistry } from "../../../../core/application/internal/factories/moduleRegistry.js";
import type { ApplicationModel } from "../../../../core/model/index.js";
import { ModelSelectors } from "../../../../core/model/index.js";
import type { Selector } from "../../../../core/store/index.js";
import { dummyAction } from "../../../mocks/application/actionMocks.js";
import { mockModelLoader } from "../../../mocks/application/modelLoaderMock.js";
import {
	createModuleMock,
	module1Mock,
	moduleModel
} from "../../../mocks/application/moduleMock.js";

describe("core.application", () => {
	describe("ApplicationFactories", () => {
		describe("createApplicationSetup (with modules)", () => {
			beforeEach(ModuleTestExtensions.reset);

			describe("given modules registered before the application setup has been created", () => {
				executeTests({ moduleRegistration: "beforeAppSetup" });
			});

			describe("given modules registered after the application setup has been created", () => {
				executeTests({ moduleRegistration: "afterAppSetup" });
			});

			function executeTests(params: { moduleRegistration: "beforeAppSetup" | "afterAppSetup" }) {
				const setup: SetupModulesAndApplication = (...modules) => {
					if (params.moduleRegistration === "beforeAppSetup") {
						modules.forEach(m => registry().addModule(m));
					}
					const config = setupApplication();
					if (params.moduleRegistration === "afterAppSetup") {
						modules.forEach(m => registry().addModule(m));
					}

					return config;
				};

				describe("and the module has middlewares", () => testMiddlewares(setup));
				describe("and the module has sagas", () => testSagas(setup));
				describe("and the module has reducers", () => testReducers(setup));
				describe("and the module has models", () => testModels(setup));
			}
		});
	});
});

interface SetupModulesAndApplication {
	(...modules: Module[]): ApplicationSetup;
}

function testMiddlewares(setup: SetupModulesAndApplication) {
	function prepare() {
		const middlewareSpies = [1, 2, 3, 4].map(createMockMiddleware);

		const middlewares = middlewareSpies.map(({ middleware }) => middleware);

		const module1WithMiddlewares = createModuleMock({
			id: "M1MidWar",
			middlewares: () => middlewares.slice(0, 2)
		});
		const module2WithMiddlewares = createModuleMock({
			id: "M2MidWar",
			middlewares: () => middlewares.slice(2)
		});
		const config = setup(module1WithMiddlewares, module2WithMiddlewares);

		return { config, middlewareSpies, module1WithMiddlewares };
	}

	it("considers the middlewares in the Redux store", () => {
		const { config, middlewareSpies } = prepare();

		config.store.dispatch(dummyAction("LirumLarum"));
		middlewareSpies.forEach(({ actionSpy }) => strictEqual(actionSpy.mock.callCount(), 1));
	});

	describe("and a module was removed later", () => {
		it("doesn't consider the middlewares of this module in the Redux store", () => {
			const { config, middlewareSpies, module1WithMiddlewares } = prepare();
			registry().removeModule(module1WithMiddlewares);

			config.store.dispatch(dummyAction("LirumLarum"));
			middlewareSpies
				.slice(0, 2)
				.forEach(({ actionSpy }) => strictEqual(actionSpy.mock.callCount(), 0));
			middlewareSpies
				.slice(2)
				.forEach(({ actionSpy }) => strictEqual(actionSpy.mock.callCount(), 1));
		});
	});
}

function createMockMiddleware() {
	const actionSpy = mock.fn();

	const middleware: Middleware = () => next => action => {
		if (dummyAction.match(action)) {
			actionSpy();
		}
		return next(action);
	};
	return { actionSpy, middleware };
}

function testSagas(setup: SetupModulesAndApplication) {
	function prepare() {
		const mockSagas = [1, 2, 3, 4].map(createMockSaga);
		const sagas = mockSagas.map(mockSaga => mockSaga.saga);

		const module1WithSagas = createModuleMock({
			id: "M1Saga",
			sagas: () => sagas.slice(0, 2)
		});
		const module2WithSagas = createModuleMock({
			id: "M2Saga",
			sagas: () => sagas.slice(2)
		});

		const config = setup(module1WithSagas, module2WithSagas);

		return { config, mockSagas, module1WithSagas };
	}

	it("starts the sagas", () => {
		const { config, mockSagas } = prepare();
		config.store.dispatch(dummyAction("LirumLarum"));
		mockSagas.forEach(spy => strictEqual(spy.dummyActionProcessedSpy.mock.callCount(), 1));
	});
	describe("and a module was removed later", () => {
		it("cancels the sagas", () => {
			const { config, mockSagas, module1WithSagas } = prepare();
			registry().removeModule(module1WithSagas);

			config.store.dispatch(dummyAction("LirumLarum"));
			mockSagas
				.slice(0, 2)
				.forEach(spy => strictEqual(spy.dummyActionProcessedSpy.mock.callCount(), 0));
			mockSagas
				.slice(2)
				.forEach(spy => strictEqual(spy.dummyActionProcessedSpy.mock.callCount(), 1));
		});
	});
}

function createMockSaga() {
	const dummyActionProcessedSpy = mock.fn();

	const saga = function* mockSaga(): SagaGenerator<void> {
		yield take((a: AnyAction) => a.type === dummyAction.type);
		dummyActionProcessedSpy();
	};

	return { dummyActionProcessedSpy, saga };
}

function testReducers(setup: SetupModulesAndApplication) {
	function prepare() {
		const reducerSpies = {
			reducer1: mock.fn(),
			reducer2: mock.fn(),
			reducer3: mock.fn(),
			reducer4: mock.fn()
		};

		const module1WithReducers = createModuleMock({
			id: "M1Reducers",
			reducersMap: mockReducerSelector({
				reducer1: reducerSpies.reducer1,
				reducer2: reducerSpies.reducer2
			})
		});

		const module2WithReducers = createModuleMock({
			id: "M2Reducers",
			reducersMap: mockReducerSelector({
				reducer3: reducerSpies.reducer3,
				reducer4: reducerSpies.reducer4
			})
		});

		const config = setup(module1WithReducers, module2WithReducers);

		return {
			config,
			reducerSpies,
			module1WithReducers,
			module2WithReducers
		};
	}

	it("considers the reducers in the Redux store", () => {
		const { config, reducerSpies } = prepare();

		config.store.dispatch(dummyAction("LirumLarum"));
		Object.values(reducerSpies).forEach(spy => strictEqual(spy.mock.callCount(), 1));
	});

	describe("and a module was removed later", () => {
		it("doesn't consider the reducers of this module in the Redux store", () => {
			const { config, reducerSpies, module1WithReducers } = prepare();

			registry().removeModule(module1WithReducers);

			config.store.dispatch(dummyAction("LirumLarum"));
			Object.values(reducerSpies)
				.slice(0, 2)
				.forEach(spy => strictEqual(spy.mock.callCount(), 0));
			Object.values(reducerSpies)
				.slice(2)
				.forEach(spy => strictEqual(spy.mock.callCount(), 1));
		});
	});

	describe("and a module is added later with an already existing reducer", () => {
		it("throws an error", () => {
			const { reducerSpies } = prepare();

			const module3WithReducers = createModuleMock({
				id: "M3Reducers",
				reducersMap: mockReducerSelector({ reducer1: reducerSpies.reducer1 })
			});
			throws(() => registry().addModule(module3WithReducers), {
				message: "Module M3Reducers defines state slices that already exist."
			});
		});
	});
}

function reducer(state: object, action: AnyAction, spy: Mock<() => unknown>): object {
	if (action.type === "Mock-Actions/DUMMY") {
		spy();
	}
	return state;
}

function mockReducerSelector(spies: { [key: string]: Mock<() => unknown> }): Selector<ReducerMap> {
	return state => {
		const reducerMap: {
			[key: string]: (state: object, action: AnyAction) => object;
		} = {};
		for (const [key, spy] of Object.entries(spies)) {
			reducerMap[key] = (s: object, action: AnyAction) => reducer(state, action, spy);
		}

		return reducerMap;
	};
}

function testModels(setup: SetupModulesAndApplication) {
	function prepare() {
		const moduleWithModel = createModuleMock({
			id: "ModuleWithModel",
			model: () => moduleModel
		});
		const config = setup(module1Mock, moduleWithModel);

		return { config, moduleWithModel };
	}

	it("contains the models in the application model", () => {
		const { config } = prepare();
		const actualModel = ModelSelectors.applicationModel()(config.store.getState());
		strictEqual(actualModel?.content.modules.length, 1);
	});

	it("doesn't contain the models in the application model anymore after removing the module", () => {
		const { config, moduleWithModel } = prepare();
		registry().removeModule(moduleWithModel);
		let actualModel = ModelSelectors.applicationModel()(config.store.getState());
		strictEqual(actualModel?.content.modules.length, 0);

		registry().addModule(moduleWithModel);
		actualModel = ModelSelectors.applicationModel()(config.store.getState());
		strictEqual(actualModel?.content.modules.length, 1);
	});

	describe("and a scene of this model matches an activity in the store", () => {
		it("doesn't allow the removal of this module", () => {
			const { config, moduleWithModel } = prepare();
			config.store.dispatch(
				ActivityActions.create({
					activityDescriptor: { page: "module_2_page" },
					activityId: "A",
					loadingState: "without"
				})
			);
			throws(() => {
				registry().removeModule(moduleWithModel);
			});
		});
	});
}

function registry(): ModuleRegistry {
	return ModuleRegistryProvider.getInstance();
}

function setupApplication(): ApplicationSetup {
	const model: ApplicationModel = {
		header: {
			id: "MOCK-MODEL",
			modelType: "application",
			modelVersion: "1.0.0"
		},
		content: {
			region: {
				name: "APP",
				layout: { name: "ApplicationFrame" },
				subRegions: [
					{ name: "CONTENT", layout: { name: "MasterDetail" } },
					{ name: "SIDEBAR", layout: { name: "Null" } },
					{ name: "MODAL", layout: { name: "Stack" } }
				]
			},
			defaultRegion: ["CONTENT"],
			modules: []
		}
	};

	const defaultSetup: ApplicationFactories.Config = {
		model,
		modelLoader: mockModelLoader,
		dataHandlers: [],
		additionalMiddlewares: []
	};

	return ApplicationFactories.createApplicationSetup(defaultSetup);
}
