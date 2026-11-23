// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";

import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";
import { localizableFromModel } from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/LocalizableFactory.js";
import { SizeContext } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/size-detector/main/size-context.js";
import type { MenuItem } from "@com.mgmtp.a12.widgets/widgets-core/lib/menu/main/menu.api.js";

import { ActivityActions, ActivitySelectors } from "../../../../activity/index.js";
import { ClientWidgetMapContext } from "../../../../ClientWidgetMap.js";
import {
	dynamicSceneByReference,
	dynamicSceneReferenceByActivityId
} from "../../../../configurationNG/internal/dynamicSelectors.js";
import { ApplicationModel } from "../../../../model/index.js";
import { InternalModelSelectors, ModelSelectors } from "../../../../model/internal/selectors.js";
import type { View, ViewNGProps } from "../../../../view/index.js";
import { ViewSelectors } from "../../../../view/index.js";
import { isOnSmallDevice } from "../../../../view/internal/size-context.js";

import { SidebarContext } from "../ApplicationFrameLayout.js";

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
