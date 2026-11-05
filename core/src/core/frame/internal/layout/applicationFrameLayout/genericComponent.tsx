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

import type { JSX } from "react";
import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";

import { localizableFromModel } from "@com.mgmtp.a12.utils/utils-localization";
import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react";
import { SizeContext, type MenuItem } from "@com.mgmtp.a12.widgets/widgets-core";

import { ActivityActions } from "../../../../activity/internal/actions.js";
import { ActivitySelectors } from "../../../../activity/internal/selectors.js";
import { ClientWidgetMapContext } from "../../../../ClientWidgetMap.js";
import {
	dynamicSceneByReference,
	dynamicSceneReferenceByActivityId
} from "../../../../configurationNG/internal/dynamicSelectors.js";
import { ApplicationModel } from "../../../../model/internal/ApplicationModel.js";
import { InternalModelSelectors, ModelSelectors } from "../../../../model/internal/selectors.js";
import { ViewSelectors } from "../../../../view/internal/selectors.js";
import { isOnSmallDevice } from "../../../../view/internal/size-context.js";
import type { View } from "../../../../view/internal/view.js";
import type { ViewNGProps } from "../../../../view/internal/viewNG.js";

import { SidebarContext } from "./sidebarContext.js";

/** @internal */
export function GenericCaseMenu(props: View): JSX.Element {
	const dispatch = useDispatch();
	const { SlidingMenu, FlyoutMenu } = useContext(ClientWidgetMapContext);

	const sceneReference = useSelector(
		ViewSelectors.sceneReferenceByActivityId(props.activityId),
		ApplicationModel.SceneReference.equal
	);
	if (sceneReference === undefined) {
		throw new Error("No scene reference available for activity " + props.activityId);
	}

	const { cases, defaultCase } = useSelector(
		InternalModelSelectors.sceneByReference(sceneReference)
	);
	if (cases === undefined) {
		throw new Error("No cases available for sceneReference " + JSON.stringify(sceneReference));
	}

	const applicationModel = useSelector(ModelSelectors.applicationModel());

	const localizer = useContext(LocalizerContext).localizer;
	const activityCase = useSelector(
		ActivitySelectors.activityPropById(props.activityId, a => a.case)
	);

	const activeCaseName = activityCase || defaultCase;

	const sidebarContext = useContext(SidebarContext);
	const currentSize = useContext(SizeContext).currentSize;

	const menuItems = cases.map(caze => {
		const key = ApplicationModel.Case.getKey(applicationModel, sceneReference, caze);
		const label = localizer(localizableFromModel(key, caze.label)) ?? "";

		return {
			label,
			selected: caze.name === activeCaseName,
			onClick: () => {
				if (isOnSmallDevice(currentSize)) {
					sidebarContext?.setSubExpanded(false);
				}
				dispatch(
					ActivityActions.setCase({
						activityId: props.activityId,
						case: caze.name
					})
				);
			}
		} as MenuItem;
	});

	return isOnSmallDevice(currentSize) || currentSize === "md" ? (
		<SlidingMenu items={menuItems} collapsed={sidebarContext?.subExpanded === false} />
	) : (
		<FlyoutMenu
			type="vertical"
			items={menuItems}
			collapsed={sidebarContext?.subExpanded === false}
		/>
	);
}

GenericCaseMenu.whyDidYouRender = true;

/**
 * @experimental
 * Same as the old generic case menu, but for dynamic scenes
 *
 * Note that this is NOT made public through `FrameFactories.viewProvider`,
 * because with `DynamicConfiguration`, there is no need to use view providers.
 *
 * Instead, the component is exported directly for usage in a dynamic flow.
 */
export function DynamicGenericCaseMenu(props: ViewNGProps): JSX.Element {
	const dispatch = useDispatch();
	const { localizer } = useContext(LocalizerContext);
	const { SlidingMenu, FlyoutMenu } = useContext(ClientWidgetMapContext);

	const dynamicSceneRef = useSelector(
		dynamicSceneReferenceByActivityId(props.activityId),
		ApplicationModel.SceneReference.equal
	);
	if (dynamicSceneRef === undefined) {
		throw new Error("No dynamic scene reference available for activity " + props.activityId);
	}

	const { cases, defaultCase } = useSelector(dynamicSceneByReference(dynamicSceneRef));

	const activityCase = useSelector(
		ActivitySelectors.activityPropById(props.activityId, a => a.case)
	);

	const activeCaseName = activityCase ?? defaultCase;

	const sidebarContext = useContext(SidebarContext);
	const { currentSize } = useContext(SizeContext);

	const menuItems = (cases ?? []).map(caze => {
		return {
			label: caze.label ? localizer(caze.label) : "",
			selected: caze.name === activeCaseName,
			onClick: () => {
				if (isOnSmallDevice(currentSize)) {
					sidebarContext?.setSubExpanded(false);
				}
				dispatch(
					ActivityActions.setCase({
						activityId: props.activityId,
						case: caze.name
					})
				);
			}
		};
	});

	return isOnSmallDevice(currentSize) || currentSize === "md" ? (
		<SlidingMenu items={menuItems} collapsed={sidebarContext?.subExpanded === false} />
	) : (
		<FlyoutMenu
			type="vertical"
			items={menuItems}
			collapsed={sidebarContext?.subExpanded === false}
		/>
	);
}

DynamicGenericCaseMenu.whyDidYouRender = true;
