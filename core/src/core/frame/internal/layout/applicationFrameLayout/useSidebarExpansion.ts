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

import { useLayoutEffect, useRef, useState } from "react";

import type { SizeDetectorProps } from "@com.mgmtp.a12.widgets/widgets-core";

import { isOnSmallDevice } from "../../../../view/internal/size-context.js";

import type { ActivityIdMap } from "../mobile-navigation.js";

import type { Region } from "./ApplicationFrameLayoutProps.js";

interface SidebarExpansionState {
	subExpanded: boolean;
	setSubExpanded: (expanded: boolean) => void;
	subExpandedState: "minimized" | "maximized" | undefined;
	setSubExpandedState: (value?: "minimized" | "maximized") => void;
}

/**
 * Manages sidebar expansion state with responsive behavior:
 * - Auto-collapses sidebar when switching to small devices
 * - Restores previous state when returning to large devices
 * - Auto-expands when new activities appear in sidebar
 * - Auto-collapses when activities are cancelled
 */
export function useSidebarExpansion(
	initialExpanded: boolean,
	initialExpandedState: "minimized" | "maximized" | undefined,
	activityIdMap: ActivityIdMap,
	sidebar: Region,
	content: Region,
	currentSize: SizeDetectorProps.Size | undefined
): SidebarExpansionState {
	const [subExpanded, setSubExpanded] = useState(initialExpanded);
	const [subExpandedFromProps, setSubExpandedFromProps] = useState(initialExpanded);
	const [subExpandedOnLargeDevice, setSubExpandedOnLargeDevice] = useState(initialExpanded);
	const [subExpandedState, setSubExpandedState] = useState(initialExpandedState);
	const [subExpandedStateFromProps, setSubExpandedStateFromProps] = useState(initialExpandedState);

	// Sync state from props when they change externally (e.g., scene change)
	if (
		(initialExpandedState !== subExpandedStateFromProps &&
			initialExpandedState !== subExpandedState) ||
		(initialExpanded !== subExpandedFromProps && initialExpanded !== subExpanded)
	) {
		setSubExpandedState(initialExpandedState);
		setSubExpandedStateFromProps(initialExpandedState);
		setSubExpanded(initialExpanded);
		setSubExpandedFromProps(initialExpanded);
		setSubExpandedOnLargeDevice(initialExpanded);
	}

	// Track previous values for change detection
	const prevRef = useRef({ currentSize, activityIdMap, content, sidebar });

	useLayoutEffect(() => {
		const prev = prevRef.current;

		// Handle responsive size changes
		if (!isOnSmallDevice(prev.currentSize) && isOnSmallDevice(currentSize)) {
			// Switching to small device: collapse and remember state
			setSubExpandedOnLargeDevice(subExpanded);
			setSubExpanded(false);
		} else if (isOnSmallDevice(prev.currentSize) && !isOnSmallDevice(currentSize)) {
			// Returning to large device: restore previous state
			setSubExpanded(subExpandedOnLargeDevice);
		} else if (isOnSmallDevice(currentSize)) {
			// On small device: handle activity changes
			const newActivityIds = Object.keys(activityIdMap).filter(
				id => !Object.keys(prev.activityIdMap).includes(id)
			);
			const hasNewSidebarActivity = sidebar.views.some(v => newActivityIds.includes(v.activityId));
			const onlyViewsInSidebar =
				prev.content.views.length > 0 && content.views.length === 0 && sidebar.views.length > 0;

			// Activity could have been cancelled or committed and is therefore no longer present in the current activityMap
			const isNewActivityRemoved = Object.keys(prev.activityIdMap).some(
				id => !(id in activityIdMap)
			);

			if (hasNewSidebarActivity || onlyViewsInSidebar) {
				setSubExpanded(true);
			} else if (isNewActivityRemoved) {
				setSubExpanded(false);
			}
		}

		prevRef.current = { currentSize, activityIdMap, content, sidebar };

		// oxlint-disable-next-line react/exhaustive-deps
	}, [currentSize, activityIdMap, content, sidebar]);

	return { subExpanded, setSubExpanded, subExpandedState, setSubExpandedState };
}
