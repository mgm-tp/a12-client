// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

/* oxlint-disable typescript/no-explicit-any */
import type { ComponentType } from "react";
import type { Dispatch, Middleware, MiddlewareAPI } from "redux";
import { combineReducers } from "redux";
// TODO: A12C-3195, SagaIterator to SagaGenerator
// oxlint-disable-next-line no-restricted-imports
import type { SagaIterator } from "redux-saga";

import type { Module, ReducerMap, ApplicationModel, View } from "@com.mgmtp.a12.client/client-core";

import { moduleAppModel as myModuleAppModel } from "./registration.js";

// tag::myModule[]
export const myModule: Module = {
	id: "my-module",

	model(state: object): ApplicationModel {
		return myModuleAppModel;
	},

	views(state: object): (componentName: string) => ComponentType<View> | undefined {
		return MyModuleFactories.createRenderer;
	},

	middlewares(store: object): Middleware[] {
		return [MyModuleFactories.createCRUDMiddleware()];
	},

	reducersMap(state: object): ReducerMap {
		return {
			slice1: MyModuleReducers1.slice1,
			slice2: combineReducers({
				slice2_1: MyModuleReducers2.slice2_1
				// ...
			})
		};
	},

	sagas(state: object): (() => SagaIterator<void>)[] {
		return [];
	}
};
// end::myModule[]

namespace MyModuleFactories {
	export const createRenderer = () => undefined;
	export const createCRUDMiddleware =
		() => (api: MiddlewareAPI) => (next: Dispatch) => (action: any) =>
			undefined;
}
namespace MyModuleReducers1 {
	export const slice1 = (state: {}, action: any) => {};
}
namespace MyModuleReducers2 {
	export const slice2_1 = (state: {}, action: any) => {};
}
