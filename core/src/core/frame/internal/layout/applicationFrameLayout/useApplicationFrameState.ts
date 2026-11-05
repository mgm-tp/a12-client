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

import deepEqual from "fast-deep-equal";
import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { ActivityActions } from "../../../../activity/internal/actions.js";
import { ActivitySelectors } from "../../../../activity/internal/selectors.js";
import { ApplicationModel } from "../../../../model/internal/ApplicationModel.js";
import { ModelSelectors } from "../../../../model/internal/selectors.js";
import { InternalViewSelectors, ViewSelectors } from "../../../../view/internal/selectors.js";

import type { RegionUiProps } from "../LayoutProps.js";
import type { ActivityIdMap, ViewWithRegionReference } from "../mobile-navigation.js";

import type { Region } from "./ApplicationFrameLayoutProps.js";

interface SubRegion {
	readonly ref: ApplicationModel.Region.Reference;
	readonly component: React.ComponentType<RegionUiProps>;
}

/** @internal */
export interface ApplicationFrameState {
	readonly sidebar: Region;
	readonly content: Region;
	readonly activityIdMap: ActivityIdMap;
	readonly contentRegion: SubRegion;
	readonly sidebarRegion: SubRegion | undefined;
	readonly modalRegion: SubRegion | undefined;
	readonly viewDirectives: ReadonlyArray<ViewWithRegionReference>;
	cancelActivities(activityIds: string[]): void;
}

/**
 * Selects and derives all state needed by ApplicationFrameLayoutComponent.
 * Uses optimized selectors with equality checks to minimize re-renders.
 * @internal
 */
export function useApplicationFrameState(
	regionReference: ApplicationModel.Region.Reference,
	regionUiProvider: (ref: ApplicationModel.Region.Reference) => React.ComponentType<RegionUiProps>,
	views: readonly unknown[]
): ApplicationFrameState {
	const dispatch = useDispatch();

	const subRegionRefs = useSelector(ModelSelectors.subRegionRefs(regionReference), deepEqual);
	const allViews = useSelector(InternalViewSelectors.allViews(), deepEqual);
	const sidebar = useSelector(ViewSelectors.region(["SIDEBAR"]), deepEqual);
	const content = useSelector(ViewSelectors.region(["CONTENT"]), deepEqual);

	const activityIds = useSelector(
		state => new Set(Object.keys(ActivitySelectors.activities()(state))),
		(a, b) => a.size === b.size && [...a].every(id => b.has(id))
	);

	const activityIdMap: ActivityIdMap = useSelector(state => {
		const activities = ActivitySelectors.activities()(state);
		return Object.fromEntries(
			Object.entries(activities).map(function mapActivityEntry([id, activity]) {
				return activity ? [id, activity.initiatingActivityId] : [];
			}) as [string, string | undefined][]
		);
	}, deepEqual);

	const subRegions = useMemo(
		() =>
			subRegionRefs.map(function createSubRegion(ref) {
				return { ref, component: regionUiProvider(ref) };
			}),
		[subRegionRefs, regionUiProvider]
	);

	if (subRegions.length === 0) {
		if (views.length > 0) {
			throw new Error("ApplicationFrameLayout does not support views");
		} else {
			throw new Error("ApplicationFrameLayout: Missing sub-regions");
		}
	}

	const contentRegion = subRegions.find(findSubRegionByName("CONTENT"));
	if (contentRegion === undefined) {
		throw new Error("ApplicationFrameLayout: No content region found");
	}

	const sidebarRegion =
		sidebar.views.length > 0 ? subRegions.find(findSubRegionByName("SIDEBAR")) : undefined;

	const modalRegion = subRegions.find(findSubRegionByName("MODAL"));

	const viewDirectives = useMemo(
		() => allViews.filter(view => activityIds.has(view.activityId)),
		[allViews, activityIds]
	);

	const cancelActivities = useCallback(
		(ids: string[]) => dispatch(ActivityActions.cancelRequested({ activityIds: ids })),
		[dispatch]
	);

	return {
		sidebar,
		content,
		activityIdMap,
		contentRegion,
		sidebarRegion,
		modalRegion,
		viewDirectives,
		cancelActivities
	};
}

function findSubRegionByName(name: string): (subRegion: SubRegion) => boolean {
	return function findRefByName({ ref }) {
		return ApplicationModel.Region.Reference.name(ref) === name;
	};
}
