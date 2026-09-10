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

import type { Store } from "redux";

import { LoggerFactory } from "@com.mgmtp.a12.utils/utils-logging/lib/factory.js";

import { ActivityMap } from "../../../activity/internal/activityMap.js";
import { ActivitySelectors } from "../../../activity/internal/selectors.js";
import { convertMatchConditionsInScene } from "../../../configurationNG/internal/convertMatchConditions.js";
import { selectPossibleObject } from "../../../store/internal/selectors.js";
import type { DynamicMatchCondition } from "../../../configurationNG/internal/typings.js";

import { ModuleRegistryImpl } from "./moduleRegistry.js";
import type { ModuleRegistryEventInterceptor } from "./moduleRegistry.js";

const logger = LoggerFactory.getLogger("core/application");

// The ModuleRegistry singleton instance
let moduleRegistry: ModuleRegistryImpl | undefined;

// Allows to intercept (suppress) events by returning true
let moduleRegistryEventInterceptor: ModuleRegistryEventInterceptor = () => false;

/** @internal */
export function getModuleRegistryInstance(): ModuleRegistryImpl {
	if (moduleRegistry === undefined) {
		moduleRegistry = new ModuleRegistryImpl(moduleRegistryEventInterceptorHolder);
	}
	return moduleRegistry;
}

// This is necessary so that the ModuleRegistry picks up changed values of moduleRegistryEventInterceptor
const moduleRegistryEventInterceptorHolder: ModuleRegistryEventInterceptor = event => {
	return moduleRegistryEventInterceptor(event);
};

/**
 * Initializes a ModuleRegistryEventInterceptor that prevents the removing of a module if
 * an activity exists which descriptor matches a screen of the module.
 * @internal
 */
export function initializeInterceptor(store: Store<object>): void {
	moduleRegistryEventInterceptor = event => {
		if (event.type !== "REMOVE" || !(event.module.model || "flows" in event.module)) {
			return false;
		}

		const runtimeMatchConditions =
			"flows" in event.module
				? selectPossibleObject(event.module.flows)(store.getState())?.flatMap(f =>
						f.scenes.map(s => s.matches ?? (() => true))
					)
				: event.module
						.model?.(store.getState())
						.content.modules.flatMap(m =>
							m.flows.flatMap(f =>
								f.scenes.map(s => convertMatchConditionsInScene(s.matchConditions))
							)
						);

		const activityIds = findActivityIds(store.getState(), runtimeMatchConditions);
		if (activityIds.length === 0) {
			return false;
		}

		logger.error(`Active screens of module ${event.module.id} found in activities:`, activityIds);
		return true;
	};
}

/**
 * Find activities that contain screens of the given modules
 */
function findActivityIds(
	state: object,
	runtimeMatchConditions: DynamicMatchCondition[] = []
): string[] {
	const activities = ActivityMap.toList(ActivitySelectors.activities()(state));

	return activities.flatMap(activity =>
		runtimeMatchConditions.some(matches => matches(activity.descriptor)) ? activity.id : []
	);
}

/**
 * Contains functions only useful for testing modules or the module registry
 */
export namespace ModuleTestExtensions {
	/**
	 * @experimental
	 * Only for automated tests!
	 *
	 * Use this function to discard any existing ModuleRegistry along with all
	 * modules inside it, e.g. if you recreate the store in a running VM.
	 */
	export function reset(): void {
		moduleRegistry = undefined;
	}
}
