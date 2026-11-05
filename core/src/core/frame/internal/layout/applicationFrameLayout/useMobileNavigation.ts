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

import { useMemo } from "react";

import type { SizeDetectorProps } from "@com.mgmtp.a12.widgets/widgets-core";

import { ApplicationModel } from "../../../../model/internal/ApplicationModel.js";
import { isOnSmallDevice } from "../../../../view/internal/size-context.js";

import {
	type ActivityIdMap,
	type RegionInformation,
	type ViewWithRegionReference,
	MobileNavigationAction
} from "../mobile-navigation.js";

/** @internal */
export interface MobileNavigationResult {
	readonly mobileMode: boolean;
	readonly visibleRegion: "CONTENT" | "SIDEBAR";
	readonly hideHeaderFooter: boolean;
	onSidebarBackButtonClicked: (() => void) | undefined;
	onContentBackButtonClicked: (() => void) | undefined;
}

/** @internal */
export interface UseMobileNavigationProps {
	readonly subExpanded: boolean;
	setSubExpanded: (expanded: boolean) => void;
	readonly hasSidebar: boolean;
	readonly disableMobileNavigation: boolean | undefined;
	cancelActivities: (ids: string[]) => void;
	readonly viewDirectives: ReadonlyArray<ViewWithRegionReference>;
	readonly activityIdMap: ActivityIdMap;
	createRegionInfo: (name: "SIDEBAR" | "CONTENT") => RegionInformation;
	readonly currentSize: SizeDetectorProps.Size | undefined;
}
/**
 * Calculates mobile navigation state and back button handlers.
 * @internal
 */
export function useMobileNavigation({
	subExpanded,
	setSubExpanded,
	hasSidebar,
	disableMobileNavigation,
	cancelActivities,
	viewDirectives,
	activityIdMap,
	createRegionInfo,
	currentSize
}: UseMobileNavigationProps): MobileNavigationResult {
	const mobileMode = isOnSmallDevice(currentSize);
	const mobileNavigationEnabled = mobileMode && disableMobileNavigation !== true;
	const visibleRegion = !subExpanded || !hasSidebar ? "CONTENT" : "SIDEBAR";

	const backButtonAction = useMemo(() => {
		if (!mobileNavigationEnabled) {
			return undefined;
		}

		return MobileNavigationAction.calculate({
			listOfViews: viewDirectives.filter(
				d => !ApplicationModel.Region.Reference.equal(d.regionReference, ["MODAL"])
			),
			activityIdMap,
			regionInformation: [createRegionInfo("SIDEBAR"), createRegionInfo("CONTENT")],
			visibleRegion: [visibleRegion]
		});
	}, [mobileNavigationEnabled, viewDirectives, activityIdMap, createRegionInfo, visibleRegion]);

	const onSidebarBackButtonClicked = useMemo(() => {
		if (visibleRegion !== "SIDEBAR" || backButtonAction?.type !== "CancelActivity") {
			return undefined;
		}
		return () => cancelActivities(backButtonAction.activitiesToCancel);
	}, [visibleRegion, backButtonAction, cancelActivities]);

	const onContentBackButtonClicked = useMemo(() => {
		if (visibleRegion !== "CONTENT" || !backButtonAction) {
			return undefined;
		}
		if (backButtonAction.type === "RegionSwitch") {
			return ApplicationModel.Region.Reference.equal(backButtonAction.switchToRegion, ["SIDEBAR"])
				? () => setSubExpanded(true)
				: undefined;
		}
		return () => cancelActivities(backButtonAction.activitiesToCancel);
	}, [visibleRegion, backButtonAction, setSubExpanded, cancelActivities]);

	return {
		mobileMode,
		visibleRegion,
		hideHeaderFooter: backButtonAction !== undefined,
		onSidebarBackButtonClicked,
		onContentBackButtonClicked
	};
}
