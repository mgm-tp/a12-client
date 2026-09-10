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

import { deepEqual, equal } from "node:assert/strict";
import { mock } from "node:test";

import { pipe } from "fp-ts/lib/function.js";
import { Fragment, type PropsWithChildren } from "react";
import type { Middleware, Reducer, StoreEnhancer } from "redux";
import { type Store } from "redux";
import type { Action } from "redux-saga";
import type { SagaGenerator } from "typed-redux-saga";
import type { ActionCreator, AnyAction } from "typescript-fsa";

import { render, within } from "@com.mgmtp.a12.devtools/react";

import type { ActivityReducers } from "../../../../core/activity/index.js";
import type {
	ApplicationSaga,
	ComposeEnhancer,
	ReducerMap
} from "../../../../core/application/index.js";
import type { A12ApplicationConfig } from "../../../../core/application/internal/factories/applicationConfig.js";
import {
	addAdditionalMiddlewares,
	addApplicationBusyTriggers,
	addComposeEnhancer,
	addCustomSagas,
	addDataHandlers,
	addDataReducers,
	addErrorBoundary,
	addInitialAction,
	addLayout,
	addPlatformSagas,
	addProgressIndicator,
	addReduxSetupAction,
	addRegion,
	addRootReducer,
	addView,
	addWrapper,
	combineFeatures,
	modifyLayout,
	modifyView,
	setConfigured,
	withApplicationResetTriggers,
	withModel,
	withModelLoader,
	withReducerMap
} from "../../../../core/application/internal/factories/applicationFactory.js";
import type { DataHandler } from "../../../../core/data/index.js";
import type { Layout } from "../../../../core/frame/internal/layout/LayoutProps.js";
import type { ApplicationModel } from "../../../../core/model/index.js";
import type { ModelLoader } from "../../../../core/model/internal/ModelLoader.js";
import { toA12Config } from "../../../utils/test-utils.js";

describe("core.application.applicationFactory", () => {
	it("addInitialActions", async () => {
		const expected1 = mock.fn(() => {});
		const expected2 = mock.fn(() => {});
		const baseConfig: A12ApplicationConfig = toA12Config({ config: {} });
		const action1 = addInitialAction(expected1);
		const action2 = addInitialAction(expected2);

		const result = combineFeatures(action1, action2)(baseConfig);
		await result.initialActions?.({} as Store);

		deepEqual(baseConfig.config, {});
		equal(expected1.mock.callCount(), 1);
		equal(expected2.mock.callCount(), 1);
	});

	it("addReduxSetupAction", () => {
		const expected1: AnyAction = {
			type: "Action1"
		};
		const expected2: AnyAction = {
			type: "Action2"
		};
		const baseConfig: A12ApplicationConfig = toA12Config({ config: {} });
		const action1 = addReduxSetupAction(expected1);
		const action2 = addReduxSetupAction(expected2);

		const result = combineFeatures(action1, action2)(baseConfig);

		deepEqual(baseConfig.config, {});
		deepEqual(result.config.setupActions, [expected1, expected2]);
	});

	it("addApplicationBusyTriggers", () => {
		const expected1 = {} as ActionCreator<unknown>;
		const expected2 = {} as ActionCreator<unknown>;
		const baseConfig: A12ApplicationConfig = toA12Config({ config: {} });
		const trigger1 = addApplicationBusyTriggers({ start: [expected1], end: [expected1] });
		const trigger2 = addApplicationBusyTriggers({ start: [expected2], end: [expected2] });

		const result = combineFeatures(trigger1, trigger2)(baseConfig);

		deepEqual(baseConfig.config, {});
		deepEqual(result.config.applicationBusyTriggers?.start, [expected1, expected2]);
		deepEqual(result.config.applicationBusyTriggers?.end, [expected1, expected2]);
	});

	it("withApplicationResetTriggers", () => {
		const expected = { resetRequested: [], resetConfirmed: {} as Action, reset: [] };
		const baseConfig: A12ApplicationConfig = toA12Config({ config: {} });
		const trigger = withApplicationResetTriggers(expected);

		const result = trigger(baseConfig);

		deepEqual(baseConfig.config, {});
		equal(result.config.applicationResetTriggers, expected);
	});

	it("addDataHandlers", () => {
		const expected1 = {} as DataHandler;
		const expected2 = {} as DataHandler;
		const baseConfig: A12ApplicationConfig = toA12Config({ config: {} });
		const dataHandler1 = addDataHandlers(expected1);
		const dataHandler2 = addDataHandlers(expected2);

		const result = combineFeatures(dataHandler1, dataHandler2)(baseConfig);

		deepEqual(baseConfig.config, {});
		deepEqual(result.config.dataHandlers, [expected1, expected2]);
	});

	it("addCustomSagas", () => {
		const expected1 = mock.fn<() => SagaGenerator<void>>();
		const expected2 = mock.fn<() => SagaGenerator<void>>();
		const baseConfig: A12ApplicationConfig = toA12Config({ config: {} });
		const saga1 = addCustomSagas(expected1);
		const saga2 = addCustomSagas(expected2);

		const result = combineFeatures(saga1, saga2)(baseConfig);

		deepEqual(baseConfig.config, {});
		deepEqual(result.config.customSagas, [expected1, expected2]);
	});

	it("addAdditionalMiddlewares", () => {
		const expected1 = mock.fn<Middleware>();
		const expected2 = mock.fn<Middleware>();
		const baseConfig: A12ApplicationConfig = toA12Config({ config: {} });
		const middleware1 = addAdditionalMiddlewares(expected1);
		const middleware2 = addAdditionalMiddlewares(expected2);

		const result = combineFeatures(middleware1, middleware2)(baseConfig);

		deepEqual(baseConfig.config, {});
		deepEqual(result.config.additionalMiddlewares, [expected1, expected2]);
	});

	it("addDataReducers", () => {
		const expected1 = {} as ActivityReducers.DataReducer;
		const expected2 = {} as ActivityReducers.DataReducer;
		const baseConfig: A12ApplicationConfig = toA12Config({ config: {} });
		const reducer1 = addDataReducers(expected1);
		const reducer2 = addDataReducers(expected2);

		const result = combineFeatures(reducer1, reducer2)(baseConfig);

		deepEqual(baseConfig.config, {});
		deepEqual(result.config.dataReducers, [expected1, expected2]);
	});

	it("withReducerMap", () => {
		const expected1 = {} as ReducerMap;
		const baseConfig: A12ApplicationConfig = toA12Config({ config: {} });
		const reducer1 = withReducerMap(expected1);

		const result = reducer1(baseConfig);

		deepEqual(baseConfig.config, {});
		deepEqual(result.config.reducerMap, expected1);
	});

	it("addRootReducer", () => {
		const expectedReducer1 = mock.fn<Reducer>();
		const expected1 = mock.fn(_ => expectedReducer1);
		const expectedReducer2 = mock.fn<Reducer>();
		const expected2 = mock.fn(_ => expectedReducer2);
		const baseConfig: A12ApplicationConfig = toA12Config({ config: {} });
		const rootReducer1 = addRootReducer(expected1);
		const rootReducer2 = addRootReducer(expected2);

		const result = combineFeatures(rootReducer1, rootReducer2)(baseConfig);

		const mockReducer = mock.fn<Reducer>();
		deepEqual(baseConfig.config, {});
		equal(result.config.rootReducer?.(mockReducer), expectedReducer2);
		equal(expected1.mock.calls[0].arguments[0], mockReducer);
		equal(expected2.mock.calls[0].arguments[0], expectedReducer1);
	});

	it("addPlatformSagas", () => {
		const expected1 = {} as ApplicationSaga.Descriptor;
		const expected2 = {} as ApplicationSaga.Descriptor;
		const baseConfig: A12ApplicationConfig = toA12Config({ config: {} });
		const saga1 = addPlatformSagas(expected1);
		const saga2 = addPlatformSagas(expected2);

		const result = combineFeatures(saga1, saga2)(baseConfig);

		deepEqual(baseConfig.config, {});
		deepEqual(result.config.overridePlatformSagas, [expected1, expected2]);
	});

	it("withModelLoader", () => {
		const expected1 = {} as ModelLoader;
		const baseConfig: A12ApplicationConfig = toA12Config({ config: {} });
		const modelLoader1 = withModelLoader(expected1);

		const result = modelLoader1(baseConfig);

		deepEqual(baseConfig.config, {});
		deepEqual(result.config.modelLoader, expected1);
	});

	it("withModel", () => {
		const expected1 = {} as ApplicationModel;
		const baseConfig: A12ApplicationConfig = toA12Config({ config: {} });
		const model1 = withModel(expected1);

		const result = model1(baseConfig);

		deepEqual(baseConfig.config, {});
		deepEqual(result.config.model, expected1);
	});

	it("addView", () => {
		const TestComponent1 = () => <></>;
		const TestComponent2 = () => <></>;
		const baseConfig: A12ApplicationConfig = toA12Config({ config: {} });
		const view1 = addView("view1", TestComponent1);
		const view2 = addView("view2", TestComponent1);
		const view3 = addView("view2", TestComponent2);

		const result = combineFeatures(view1, view2, view3)(baseConfig);

		deepEqual(baseConfig.config, {});
		equal(result.config.views?.("view1"), TestComponent1);
		equal(result.config.views?.("view2"), TestComponent2);
	});

	it("modifyView", () => {
		const TestComponent1 = () => <></>;
		const TestComponent2 = () => <></>;
		const expected1 = mock.fn(_ => TestComponent1);
		const expected2 = mock.fn(_ => TestComponent2);
		const baseConfig: A12ApplicationConfig = toA12Config({ config: {} });
		const modify1 = modifyView("view1", expected1);
		const modify2 = modifyView("view2", expected1);
		const modify3 = modifyView("view2", expected2);

		const result = combineFeatures(modify1, modify2, modify3)(baseConfig);

		const mockView = mock.fn();
		deepEqual(baseConfig.config, {});
		equal(result.config.viewModifications?.("view1")?.(mockView), TestComponent1);
		equal(result.config.viewModifications?.("view2")?.(mockView), TestComponent2);
		equal(expected1.mock.calls[0].arguments[0], mockView);
		equal(expected2.mock.calls[0].arguments[0], TestComponent1);
	});

	it("addLayout", () => {
		const testLayout1 = {} as Layout;
		const testLayout2 = {} as Layout;
		const baseConfig: A12ApplicationConfig = toA12Config({ config: {} });
		const layout1 = addLayout("layout1", testLayout1);
		const layout2 = addLayout("layout2", testLayout1);
		const layout3 = addLayout("layout2", testLayout2);

		const result = combineFeatures(layout1, layout2, layout3)(baseConfig);

		deepEqual(baseConfig.config, {});
		equal(result.config.layouts?.("layout1"), testLayout1);
		equal(result.config.layouts?.("layout2"), testLayout2);
	});

	it("modifyLayout", () => {
		const testLayout1 = {} as Layout;
		const testLayout2 = {} as Layout;
		const expected1 = mock.fn(_ => testLayout1);
		const expected2 = mock.fn(_ => testLayout2);
		const baseConfig: A12ApplicationConfig = toA12Config({ config: {} });
		const modify1 = modifyLayout("layout1", expected1);
		const modify2 = modifyLayout("layout2", expected1);
		const modify3 = modifyLayout("layout2", expected2);

		const result = combineFeatures(modify1, modify2, modify3)(baseConfig);

		const mockLayout = {} as Layout;
		deepEqual(baseConfig.config, {});
		equal(result.config.layoutModifications?.("layout1")?.(mockLayout), testLayout1);
		equal(result.config.layoutModifications?.("layout2")?.(mockLayout), testLayout2);
		equal(expected1.mock.calls[0].arguments[0], mockLayout);
		equal(expected2.mock.calls[0].arguments[0], testLayout1);
	});

	it("addRegion", () => {
		const TestComponent1 = () => <></>;
		const TestComponent2 = () => <></>;
		const baseConfig: A12ApplicationConfig = toA12Config({ config: {} });
		const region1 = addRegion(["region1"], TestComponent1);
		const region2 = addRegion(["region2"], TestComponent1);
		const region3 = addRegion(["region2"], TestComponent2);

		const result = combineFeatures(region1, region2, region3)(baseConfig);

		deepEqual(baseConfig.config, {});
		equal(result.config.regions?.(["region1"]), TestComponent1);
		equal(result.config.regions?.(["region2"]), TestComponent2);
	});

	it("addProgressIndicator", () => {
		const TestComponent1 = () => <></>;
		const TestComponent2 = () => <></>;
		const baseConfig: A12ApplicationConfig = toA12Config({ config: {} });
		const indicator1 = addProgressIndicator(["region1"], "view1", TestComponent1);
		const indicator2 = addProgressIndicator(["region2"], "view2", TestComponent1);
		const indicator3 = addProgressIndicator(["region2"], "view2", TestComponent2);

		const result = combineFeatures(indicator1, indicator2, indicator3)(baseConfig);

		deepEqual(baseConfig.config, {});
		equal(result.config.progressIndicators?.(["region1"], "view1"), TestComponent1);
		equal(result.config.progressIndicators?.(["region2"], "view2"), TestComponent2);
	});

	it("addErrorBoundary", () => {
		const TestComponent1 = () => <></>;
		const TestComponent2 = () => <></>;
		const baseConfig: A12ApplicationConfig = toA12Config({ config: {} });
		const boundary1 = addErrorBoundary(["region1"], "view1", TestComponent1);
		const boundary2 = addErrorBoundary(["region2"], "view2", TestComponent1);
		const boundary3 = addErrorBoundary(["region2"], "view2", TestComponent2);

		const result = combineFeatures(boundary1, boundary2, boundary3)(baseConfig);

		deepEqual(baseConfig.config, {});
		equal(result.config.errorBoundaries?.(["region1"], "view1"), TestComponent1);
		equal(result.config.errorBoundaries?.(["region2"], "view2"), TestComponent2);
	});

	it("addWrapper", () => {
		const TestComponent1 = (props: PropsWithChildren) => <div id="1">{props.children}</div>;
		const TestComponent2 = (props: PropsWithChildren) => <div id="2">{props.children}</div>;
		const TestComponent3 = (props: PropsWithChildren) => <div id="3">{props.children}</div>;
		const baseConfig: A12ApplicationConfig = toA12Config({ config: {} });
		const wrapper1 = addWrapper(TestComponent1);
		const wrapper2 = addWrapper(TestComponent2, "outer");
		const wrapper3 = addWrapper(TestComponent3, "inner");

		const result = combineFeatures(wrapper1, wrapper2, wrapper3)(baseConfig);

		const Wrapper = result.config.WrapperComponent ?? Fragment;
		deepEqual(baseConfig.config, {});
		const rendered = render(<Wrapper />);
		const element1 = within(rendered.baseElement).getById("1");
		const element2 = within(rendered.baseElement).getById("2");
		const element3 = within(rendered.baseElement).getById("3");

		equal(element1.parentElement?.closest("div")?.id, element2.id);
		equal(element2.parentElement?.closest("div")?.id, "");
		equal(element3.parentElement?.closest("div")?.id, element1.id);
	});

	it("setConfigured", () => {
		const baseConfig = toA12Config({
			config: {},
			configured: { ["value"]: true },
			test: {},
			test2: {}
		});
		const result = pipe(baseConfig, setConfigured("test"), setConfigured("test2"));
		equal(result.configured.value, true);
		equal(result.configured.test, true);
		equal(result.configured.test2, true);
	});

	it("addComposeEnhancer", () => {
		const expectedEnhancer1 = {} as StoreEnhancer;
		const enhancer1 = mock.fn<ComposeEnhancer>(() => expectedEnhancer1);
		const expectedEnhancer2 = {} as StoreEnhancer;
		const enhancer2 = mock.fn<ComposeEnhancer>(() => expectedEnhancer2);

		const baseConfig: A12ApplicationConfig = toA12Config({ config: {} });
		const composer1 = addComposeEnhancer(enhancer1);
		const composer2 = addComposeEnhancer(enhancer2);

		const result = combineFeatures(composer1, composer2)(baseConfig);

		const mockEnhancer = {} as StoreEnhancer;
		deepEqual(baseConfig.config, {});
		equal(result.config.composeEnhancer?.(mockEnhancer), expectedEnhancer2);
		equal(enhancer1.mock.calls[0].arguments[0], mockEnhancer);
		equal(enhancer2.mock.calls[0].arguments[0], expectedEnhancer1);
	});
});
