// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Store } from "redux";

import { LoggerFactory } from "@com.mgmtp.a12.utils/utils-logging/lib/factory.js";

import { ActivityMap } from "../../../activity/internal/activityMap.js";
import { ActivitySelectors } from "../../../activity/internal/selectors.js";
import { convertMatchConditionsInScene } from "../../../configurationNG/internal/convertMatchConditions.js";
import type { DynamicMatchCondition } from "../../../configurationNG/internal/typings.js";
import { selectPossibleObject } from "../../../store/internal/selectors.js";

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
