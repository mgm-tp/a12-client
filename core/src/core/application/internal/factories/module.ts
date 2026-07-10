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

import type { Middleware } from "redux";
import type { SagaGenerator } from "typed-redux-saga";

import type { ActivityMap } from "../../../activity/index.js";
import type { ActivityReducers } from "../../../activity/internal/reducers/index.js";
import type { DataEditor } from "../../../data/internal/DataEditor.js";
import type { DataProvider } from "../../../data/internal/DataProvider.js";
import type { ApplicationModel } from "../../../model/internal/ApplicationModel.js";
import type { Selector } from "../../../store/internal/selectors.js";
import type { View } from "../../../view/internal/view.js";

import type { ReducerMap } from "./reducerMap.js";

/**
 * The Module interface is used to bundle different technical components
 * together, so that they can then be added to the `ModuleRegistry`.
 *
 * Every module registered to a provider must have a different ID to prevent
 * duplicates and to allow unique identification of modules for removal.
 *
 * A module can define its own ApplicationModel, which is then added to the
 * pre-defined ApplicationModel. It needs to be loaded before creating the
 * Module.
 *
 * The parts of the Module's ApplicationModel are processed as follows:
 * - App model modules (ApplicationModel.Module) are added
 * - Languages are added, if they are not present
 * - Regions are merged into the existing structures ignoring the layout. That
 *   means if a module defines a different layout for a region, then the
 *   existing layout is kept.
 *
 * Note: Languages and regions are added when modules are registered, but *not*
 * removed, when modules are deregistered.
 *
 * Modules can contribute View components. All modules should handle distinct
 * Views (with distinct names). If however two modules handle a View of the same
 * name, then the handler of the Module registered first takes precedence.
 *
 * Modules can contribute Redux middlewares, (slice) reducers, as well as Sagas.
 *
 * Finally, Modules can contribute Activity data reducers, Data Providers and
 * Editors.
 *
 * All properties have the form of a factory function. Except for the dataReducers
 * factory, all of them have access to the whole state. The dataReducers factory
 * only receives the activities slice.
 * This means you can use information from the given (initial) state to decide
 * what to return. Because some properties are only evaluated once (model,
 * sagas), it is better to not rely on dynamic state.
 */
export interface Module {
	readonly id: string;
	readonly model?: Selector<ApplicationModel>;
	readonly views?: Selector<(componentName: string) => View.ViewComponent | undefined>;
	readonly reducersMap?: Selector<ReducerMap>;
	readonly dataReducers?: (activityMap: ActivityMap) => ReadonlyArray<ActivityReducers.DataReducer>;
	readonly middlewares?: Selector<ReadonlyArray<Middleware>>;
	readonly sagas?: Selector<ReadonlyArray<() => SagaGenerator<void>>>;
	readonly dataProviders?: Selector<DataProvider[]>;
	// We cannot make dataEditors a selector because they need to be available before the store is created
	readonly dataEditors?: ReadonlyArray<DataEditor>;
}
