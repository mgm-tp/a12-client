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

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ComponentType } from "react";
import type { Dispatch, Middleware, MiddlewareAPI } from "redux";
import { combineReducers } from "redux";
// TODO: A12C-3195, SagaIterator to SagaGenerator
// eslint-disable-next-line no-restricted-imports
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
