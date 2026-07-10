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

import type { Activity } from "../../activity/internal/activity.js";
import { ActivityMap } from "../../activity/internal/activityMap.js";
import { ActivitySelectors } from "../../activity/internal/selectors.js";
import { ModuleRegistryProvider } from "../../application/internal/factories/moduleRegistryProvider.js";
import type { LayoutNG, RegionReferenceNG } from "../../frame/internal/layoutNG/layoutPropsNG.js";
import type { ApplicationModel } from "../../model/internal/ApplicationModel.js";
import type { Selector } from "../../store/internal/selectors.js";
import {
	selectPossibleObject,
	shallowEqualize,
	shallowEqualizeWithoutArgs
} from "../../store/internal/selectors.js";
import type { ViewNG } from "../../view/internal/viewNG.js";

import type {
	DynamicAddView,
	DynamicCase,
	DynamicClearRegion,
	DynamicDirective,
	DynamicMenu,
	DynamicRegion,
	DynamicScene
} from "./typings.js";

function dynamicModules(state: object) {
	return ModuleRegistryProvider.getInstance()
		.getAllModules()
		.flatMap(mod =>
			"flows" in mod ? { name: mod.id, flows: selectPossibleObject(mod.flows)(state) ?? [] } : []
		);
}

/** @internal */
export function dynamicSceneReferences(): Selector<readonly ApplicationModel.SceneReference[]> {
	return (state: object) => {
		return dynamicModules(state).flatMap(({ name: moduleName, flows }) =>
			flows.flatMap(({ name: flowName, scenes }) =>
				scenes.map(({ name: sceneName }) => ({ moduleName, flowName, sceneName }))
			)
		);
	};
}

/** @internal */
export function dynamicSceneReferenceByActivityDescriptors(
	activityDescriptors: Activity.Descriptor[]
): Selector<ApplicationModel.SceneReference | undefined> {
	return state => {
		return dynamicSceneReferences()(state).find(reference => {
			const s = dynamicSceneByReference(reference)(state);
			const relevantScenes = [...dynamicPriorScenes(reference)(state), s];
			const offset = activityDescriptors.length - relevantScenes.length;
			return (
				offset >= 0 &&
				relevantScenes.every(
					({ matches }, index) => matches?.(activityDescriptors[offset + index]) ?? true
				)
			);
		});
	};
}

/** @internal */
export function dynamicSceneByReference({
	moduleName,
	flowName,
	sceneName
}: ApplicationModel.SceneReference): Selector<DynamicScene> {
	return (state: object) => {
		const module = dynamicModules(state).find(({ name }) => name === moduleName);

		if (module === undefined) {
			throw new Error(`No module with the name "${moduleName}" exists.`);
		}

		const flow = module.flows.find(({ name }) => name === flowName);
		if (flow === undefined) {
			throw new Error(`No flow with the name "${flowName}" exists in the module "${moduleName}".`);
		}

		const scene = flow.scenes.find(({ name }) => name === sceneName);
		if (scene === undefined) {
			throw new Error(
				`No scene with the name "${sceneName}" exists in the flow "${flowName}" of the module "${moduleName}".`
			);
		}

		return scene;
	};
}

/** @internal */
export function dynamicPriorScenes(
	ref: ApplicationModel.SceneReference
): Selector<readonly DynamicScene[]> {
	return (state: object) => {
		const path: DynamicScene[] = [];
		let scene = dynamicSceneByReference(ref)(state);
		while (scene !== undefined && scene.priorScene !== undefined) {
			scene = dynamicSceneByReference({
				...ref,
				sceneName: scene.priorScene
			})(state);
			path.unshift(scene);
		}

		return path;
	};
}

/** @internal */
export function dynamicCase(caseName: string): (scene: DynamicScene) => DynamicCase | undefined {
	return ({ cases = [] }) => cases.find(({ name }) => name === caseName);
}

/**
 * Wrapped with `shallowEqualizeWithoutArgs` since its used in render code (MainMenu components)
 */
const dynamicMenus = shallowEqualizeWithoutArgs(dynamicMenusInternal);
function dynamicMenusInternal(): Selector<DynamicMenu[]> {
	return state => {
		return ModuleRegistryProvider.getInstance()
			.getAllModules()
			.flatMap(mod => ("menus" in mod ? (selectPossibleObject(mod.menus)(state) ?? []) : []));
	};
}

function dynamicRegions(state: object): DynamicRegion[] {
	const allRegions = ModuleRegistryProvider.getInstance()
		.getAllModules()
		.flatMap(mod => ("regions" in mod ? (selectPossibleObject(mod.regions)(state) ?? []) : []));

	return mergeDuplicates(allRegions);
}

function mergeDuplicates(regions: DynamicRegion[]): DynamicRegion[] {
	return regions.reduce((result, region) => {
		const exists = result.findIndex(r => r.name === region.name);

		if (exists < 0) {
			return result.concat(region);
		}

		const combinedSubRegions = [...(result[exists].subRegions ?? []), ...(region.subRegions ?? [])];

		result[exists] = {
			...region,
			subRegions: mergeDuplicates(combinedSubRegions)
		};

		return result;
	}, [] as DynamicRegion[]);
}

/**
 * Wrapped with `shallowEqualize` since its used in render code
 */
const dynamicRegion = shallowEqualize(dynamicRegionInternal, r => r);
function dynamicRegionInternal(
	regionReference: RegionReferenceNG
): Selector<DynamicRegion | undefined> {
	return (state: object) => findRegion(regionReference.split("/"), dynamicRegions(state));
}

function findRegion(
	[first, ...rest]: string[],
	search?: readonly DynamicRegion[]
): DynamicRegion | undefined {
	const region = search?.find(r => r.name === first);

	return region === undefined || rest.length === 0 ? region : findRegion(rest, region.subRegions);
}

const dynamicSubRegionRefs = shallowEqualize(dynamicSubRegionRefsInternal, r => r);
function dynamicSubRegionRefsInternal(
	regionReference: RegionReferenceNG
): Selector<RegionReferenceNG[]> {
	const dynamicRegionSelector = dynamicRegion(regionReference);
	return state =>
		dynamicRegionSelector(state)?.subRegions?.map(sr => `${regionReference}/${sr.name}`) ?? [];
}

/**
 * @internal
 *
 * Returns the scene reference by a given activity id based on the
 * activities present in the store.
 */
export function dynamicSceneReferenceByActivityId(
	activityId: string
): Selector<ApplicationModel.SceneReference | undefined> {
	return state => {
		const activity = ActivitySelectors.activityById(activityId)(state);
		if (activity === undefined) {
			return undefined;
		}
		const relevantActivityDescriptors = [
			...ActivitySelectors.initiatingPath(activityId)(state).map(a => a.descriptor),
			activity.descriptor
		];
		return dynamicSceneReferenceByActivityDescriptors(relevantActivityDescriptors)(state);
	};
}

// nullLayout would cause a cycle here, but we don't want to render something anyway
function EMPTY_LAYOUT() {
	return null;
}

const dynamicRegionInfo = shallowEqualize(dynamicRegionInfoInternal, rr => rr);
function dynamicRegionInfoInternal(
	regionReference: RegionReferenceNG
): Selector<{ layout: LayoutNG; views: ViewNG[] }> {
	const selectDynamicRegion = dynamicRegion(regionReference);
	const selectDynamicRenderingDirectives = dynamicRenderingDirectives();

	return state => {
		const currentRegion = selectDynamicRegion(state);
		if (currentRegion === undefined) {
			return { layout: { component: EMPTY_LAYOUT }, views: [] };
		}

		const views: ViewNG[] = [];

		const reversedDirectives = selectDynamicRenderingDirectives(state).reverse();

		for (const directive of reversedDirectives) {
			if (regionReference !== directive.region) {
				continue;
			}

			if (directive.type === "DYNAMIC_CLEAR_REGION") {
				return {
					layout: directive.layout ?? currentRegion.layout,
					views
				};
			}

			const activity = ActivitySelectors.activityById(directive.activityId)(state);
			if (activity === undefined) {
				continue;
			}

			views.unshift({
				constraints: directive.constraints,
				Component: directive.component,
				props: { activityId: activity.id }
			});
		}

		return { layout: currentRegion.layout, views };
	};
}

/**
 * @internal
 */
export interface ViewDescriptorNG extends ViewNG {
	readonly regionReference: RegionReferenceNG;
}

/**
 * @internal
 *
 * Returns the ordered list of {@link ViewDescriptorNG} based on the activities
 * and model configuration present in the store.
 */
export function dynamicAllViews(): Selector<ViewDescriptorNG[]> {
	const selectDynamicRenderingDirectives = dynamicRenderingDirectives();

	return state =>
		selectDynamicRenderingDirectives(state).flatMap(directive =>
			directive.type !== "DYNAMIC_CLEAR_REGION"
				? {
						props: {
							activityId: directive.activityId
						},
						Component: directive.component,
						regionReference: directive.region,
						constraints: directive.constraints
					}
				: []
		);
}

const dynamicRenderingDirectives = shallowEqualizeWithoutArgs(dynamicRenderingDirectivesInternal);
function dynamicRenderingDirectivesInternal(): Selector<DynamicRenderingDirective[]> {
	return state => {
		let renderingDirectives: DynamicRenderingDirective[] = [];
		const workList = ActivityMap.toOrderedList(ActivitySelectors.activities()(state));
		while (workList.length > 0) {
			const activity = workList.pop();
			if (activity === undefined) {
				continue;
			}

			const relevantActivities = [
				...ActivitySelectors.initiatingPath(activity.id)(state),
				activity
			];
			const sceneReference = dynamicSceneReferenceByActivityDescriptors(
				relevantActivities.map(a => a.descriptor)
			)(state);

			if (sceneReference !== undefined) {
				const scene = dynamicSceneByReference(sceneReference)(state);
				let caze: DynamicCase | undefined;

				if (activity.case !== undefined) {
					caze = dynamicCase(activity.case)(scene);
				}

				if (caze === undefined && scene.defaultCase !== undefined) {
					caze = dynamicCase(scene.defaultCase)(scene);
				}

				if (
					caze !== undefined &&
					caze.sceneChange !== undefined &&
					caze.sceneChange.onEnter !== undefined
				) {
					// Add all views that are created by onEnter of the view of the activity
					renderingDirectives = [
						...normalizeDynamicDirectives(caze.sceneChange.onEnter, activity.id),
						...renderingDirectives
					];
				}

				if (scene.sceneChange !== undefined && scene.sceneChange.onEnter !== undefined) {
					// Add all views that are created by onEnter of the scene of the activity
					renderingDirectives = [
						...normalizeDynamicDirectives(scene.sceneChange.onEnter, activity.id),
						...renderingDirectives
					];
				}
			}

			const initiatingActivity = relevantActivities[relevantActivities.length - 2];
			// Fast exit
			if (initiatingActivity === undefined) {
				continue;
			}

			// onExit will be only added the first time it applies. Therefore, do
			// not add onExit if there is still an activity in the workList with
			// the same initiatingActivityId.
			if (workList.some(a => a.initiatingActivityId === initiatingActivity.id)) {
				continue;
			}

			const initiatingSceneReference = dynamicSceneReferenceByActivityDescriptors(
				relevantActivities.slice(0, relevantActivities.length - 1).map(a => a.descriptor)
			)(state);

			if (initiatingSceneReference === undefined) {
				continue;
			}

			const initiatingScene = dynamicSceneByReference(initiatingSceneReference)(state);
			if (
				initiatingScene.sceneChange !== undefined &&
				initiatingScene.sceneChange.onExit !== undefined
			) {
				// Add all views that are created by onExit of the initiating activity
				renderingDirectives = [
					...normalizeDynamicDirectives(initiatingScene.sceneChange.onExit, activity.id),
					...renderingDirectives
				];
			}
		}
		return renderingDirectives;
	};
}

/**
 * @internal
 *
 * Rendering directive extending a "DYNAMIC_ADD_VIEW"
 * directive from a contributed flow
 */
export interface DynamicAddDirective extends DynamicAddView {
	readonly activityId: string;
}

/**
 * @internal
 *
 * Rendering directive extending a "DYNAMIC_CLEAR_REGION"
 * directive from a contributed flow
 */
export type DynamicClearDirective = DynamicClearRegion;

/**
 * @internal
 */
export type DynamicRenderingDirective = DynamicAddDirective | DynamicClearDirective;

function normalizeDynamicDirectives(
	directives: ReadonlyArray<DynamicDirective>,
	activityId: string
): ReadonlyArray<DynamicRenderingDirective> {
	return directives.map(directive => {
		return directive.type === "DYNAMIC_ADD_VIEW"
			? {
					...directive,
					activityId
				}
			: directive;
	});
}

/**
 * @experimental
 */
export const DynamicModelSelectors = {
	/**
	 * Selects all contributed menu entries from registered `DynamicConfiguration` modules.
	 */
	dynamicMenus,
	/**
	 * Selects the first region which matches the given region {@link RegionReferenceNG}.
	 */
	dynamicRegion,
	/**
	 * Selects the layout and its view for the region matching the given {@link RegionReferenceNG}.
	 */
	dynamicRegionInfo,
	/**
	 * Selects all sub region references which matches the given region {@link RegionReferenceNG}.
	 */
	dynamicSubRegionRefs
};
