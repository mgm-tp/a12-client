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

import { useContext } from "react";

import {
	addDotEscaping,
	localizableFromModel,
	localizableKeyFromSegments
} from "@com.mgmtp.a12.utils/utils-localization";

import { memoize } from "../../3rd-party-licenses/memoize.js";
import { ActivityActions } from "../../activity/internal/actions.js";
import { Activity } from "../../activity/internal/activity.js";
import type { ActivityMap } from "../../activity/internal/activityMap.js";
import { ApplicationActions } from "../../application/internal/actions.js";
import { assertUnreachable } from "../../assertion.js";
import { DefaultErrorBoundaryProvider } from "../../frame/internal/components/error-boundary/DefaultErrorBoundaryProvider.js";
import { LayoutProvidersContext } from "../../frame/internal/layout/LayoutProvidersContext.js";
import { convertToLayoutNG } from "../../frame/internal/layoutNG/convertToLayoutNG.js";
import { ApplicationModel } from "../../model/internal/ApplicationModel.js";
import { notUndefined } from "../../utils.js";
import type { View } from "../../view/index.js";
import type { ViewNGComponent } from "../../view/internal/viewNG.js";

import { convertMatchConditionsInScene } from "./convertMatchConditions.js";
import type {
	DynamicCase,
	DynamicDirective,
	DynamicFlow,
	DynamicMenu,
	DynamicRegion,
	DynamicScene,
	DynamicSceneChange
} from "./typings.js";

/** @internal */
export function createDynamicMenuConverter(
	appModel: ApplicationModel,
	module: ApplicationModel.Module,
	topLevelActivities: ActivityMap
) {
	const appKey = ApplicationModel.Module.getKey(appModel, module);

	const descriptors = Object.values(topLevelActivities)
		.map(a => a?.descriptor)
		.filter(notUndefined);

	return function createDynamicMenu(
		menu: ApplicationModel.Menu,
		menuNames: string[] = []
	): DynamicMenu {
		const menuNamePath = menuNames.concat(menu.name);

		const children = menu.children?.map(c => createDynamicMenu(c, menuNamePath));

		const selected =
			descriptors.some(activity =>
				Activity.Descriptor.equal(activity, menu.initialActivity?.descriptor ?? {})
			) || children?.some(child => child.selected);

		const key = `${appKey}.${localizableKeyFromSegments(menuNamePath)}`;

		const initialActivity = menu.initialActivity;

		return {
			id: menu.name,
			label: localizableFromModel(key, menu.label),
			children,
			selected,
			action: initialActivity
				? dispatch => {
						dispatch(
							ApplicationActions.startMainActivityRequested({
								action: ActivityActions.create({
									activityDescriptor: initialActivity.descriptor,
									loadingState: initialActivity.withoutData
										? "without"
										: checkIfShouldLoad(initialActivity, module)
											? "missing"
											: "without"
								}),
								descriptor: {}
							})
						);
					}
				: undefined
		} satisfies DynamicMenu;
	};
}

function checkIfShouldLoad(
	initialActivity: ApplicationModel.InitialActivity,
	module: ApplicationModel.Module
) {
	const sceneMatch = module.flows
		.flatMap(f => f.scenes)
		.find(s => convertMatchConditionsInScene(s.matchConditions)(initialActivity.descriptor));

	const sceneDirectives = [sceneMatch?.sceneChange].flatMap(sc => [
		...(sc?.onEnter ?? []),
		...(sc?.onExit ?? [])
	]);

	const caseDirectives = (sceneMatch?.cases?.map(c => c.sceneChange) ?? []).flatMap(
		sc => sc?.onEnter ?? []
	);

	return [...sceneDirectives, ...caseDirectives].some(
		d => d.type === "VIEW_ADD" && (d.loadData || d.models?.length)
	);
}

/** @internal */
export function convertToDynamicRegion(
	region: ApplicationModel.Region,
	path: ApplicationModel.Region.Reference,
	isRoot = false
): DynamicRegion {
	// root region is unnamed, so we discard region.name here
	const regionName = isRoot ? "" : region.name;
	const nextPath = isRoot ? [] : path.concat(regionName);

	return {
		name: regionName,
		layout: convertToLayoutNG(region.layout, nextPath),
		subRegions: region.subRegions?.map(r => convertToDynamicRegion(r, nextPath))
	};
}

/** @internal */
export function convertToDynamicFlow(
	flow: ApplicationModel.Flow,
	appModel: ApplicationModel,
	moduleName: string
): DynamicFlow {
	return {
		name: flow.name,
		scenes: flow.scenes.map(s => convertToDynamicScene(s, appModel, moduleName, flow.name))
	};
}

function convertToDynamicScene(
	scene: ApplicationModel.Scene,
	appModel: ApplicationModel,
	moduleName: string,
	flowName: string
): DynamicScene {
	const { name, priorScene, defaultCase, cases, matchConditions, sceneChange } = scene;

	const sceneKey = ApplicationModel.SceneReference.getKey(appModel, {
		moduleName,
		flowName,
		sceneName: name
	});

	const defaultRegion = appModel.content.defaultRegion;
	const rootRegionName = ""; //root region is unnamed, so we discard "appModel.content.region.name" here

	return {
		name,
		matches: convertMatchConditionsInScene(matchConditions),
		priorScene,
		defaultCase,
		cases: cases?.map(c => convertToDynamicCase(c, sceneKey, rootRegionName, defaultRegion)),
		sceneChange: convertToDynamicSceneChange(sceneChange, rootRegionName, defaultRegion)
	};
}

function convertToDynamicCase(
	c: ApplicationModel.Case,
	sceneKey: string,
	rootRegionName: string,
	defaultRegion: ApplicationModel.Region.Reference
): DynamicCase {
	const key = `${sceneKey}.${addDotEscaping(c.name)}`;

	return {
		name: c.name,
		label: localizableFromModel(key, c.label),
		sceneChange: convertToDynamicSceneChange(c.sceneChange, rootRegionName, defaultRegion)
	};
}

function convertToDynamicSceneChange(
	sc: ApplicationModel.SceneChange | undefined,
	rootRegionName: string,
	defaultRegion: ApplicationModel.Region.Reference
): DynamicSceneChange {
	return {
		onEnter:
			sc?.onEnter?.map(d => convertToDynamicDirective(d, rootRegionName, defaultRegion)) ?? [],
		onExit: sc?.onExit?.map(d => convertToDynamicDirective(d, rootRegionName, defaultRegion)) ?? []
	};
}

function convertToDynamicDirective(
	dir: ApplicationModel.Directive,
	rootRegionName: string,
	defaultRegion: ApplicationModel.Region.Reference
): DynamicDirective {
	const regionRef = [rootRegionName, ...(dir.region ?? defaultRegion)];

	switch (dir.type) {
		case "VIEW_ADD": {
			return {
				type: "DYNAMIC_ADD_VIEW",
				component: createMemoizedView(dir.name, regionRef.slice(1), dir.constraints),
				region: regionRef.join("/"),
				models: dir.models,
				constraints: dir.constraints
			};
		}
		case "REGION_CLEAR": {
			return {
				type: "DYNAMIC_CLEAR_REGION",
				region: regionRef.join("/"),
				layout: dir.layout ? convertToLayoutNG(dir.layout, regionRef.slice(1)) : undefined
			};
		}
		default:
			assertUnreachable(dir);
	}
}

const createMemoizedView = memoize(
	(
		name: View["name"],
		ref: ApplicationModel.Region.Reference,
		constraints: View["constraints"]
	): ViewNGComponent => {
		return props => {
			const {
				viewProvider,
				progressComponentProvider,
				errorBoundaryProvider = DefaultErrorBoundaryProvider
			} = useContext(LayoutProvidersContext);

			const View = viewProvider(name);
			const Boundary = errorBoundaryProvider(ref, name);
			const ProgressComponent = progressComponentProvider(ref, name);

			return (
				<Boundary activityId={props.activityId} ariaLevel={props.ariaLevel}>
					{View.handleProgressIndicator ? (
						<View
							{...props}
							name={name}
							constraints={constraints}
							ProgressComponent={ProgressComponent}
						/>
					) : (
						<ProgressComponent activityId={props.activityId}>
							<View {...props} name={name} constraints={constraints} />
						</ProgressComponent>
					)}
				</Boundary>
			);
		};
	},
	(name, ref, constraints) => `${name}.${ref.join(".")}.${JSON.stringify(constraints)}`
);
