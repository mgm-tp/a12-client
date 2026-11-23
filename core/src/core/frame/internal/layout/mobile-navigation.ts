// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { ApplicationModel } from "../../../model/index.js";
import type { View } from "../../../view/index.js";

const PRIORITY_ORDERED_REGIONS = [["SIDEBAR"], ["CONTENT"]];

/**
 * Structure that maps the id of an activity to the id of its initiating activity (if it exists)
 * @internal
 */
export interface ActivityIdMap {
	readonly [activityId: string]: string | undefined;
}

/** @internal */
export interface RegionSwitch {
	readonly type: "RegionSwitch";
	readonly switchToRegion: ApplicationModel.Region.Reference;
}

/** @internal */
export interface CancelActivity {
	readonly type: "CancelActivity";
	readonly activitiesToCancel: string[];
}

/** @internal */
export interface RegionInformation {
	readonly regionReference: ApplicationModel.Region.Reference;
	readonly clearedAfter?: number;
	readonly views: View[];
}

/** @internal */
export type MobileNavigationAction = RegionSwitch | CancelActivity;

/** @internal */
export interface ViewWithRegionReference extends View {
	readonly regionReference: ApplicationModel.Region.Reference;
}

/**
 * @internal
 * Function to calculate the mobile navigation behavior
 * @param args
 * 	- visibleRegion: The currently visible region
 *  - listOfViews: List of all current views
 * 	- regionInformation: Information about the different regions, containing the "clearedAfter" information
 * 						 as well as their views
 * 	- activityIds: List of activity ids. They are necessary to find container activities,
 * 				   which need to be cancelled if their children are cancelled
 *
 *  Note: the object wrapper is necessary to ensure that the function is mockable
 */
export const MobileNavigationAction = {
	calculate: function calculateMobileNavigationAction(args: {
		readonly visibleRegion: ApplicationModel.Region.Reference;
		readonly regionInformation: RegionInformation[];
		readonly activityIdMap: ActivityIdMap;
		readonly listOfViews: ReadonlyArray<ViewWithRegionReference>;
	}): MobileNavigationAction | undefined {
		const indexOfVisibleRegion = PRIORITY_ORDERED_REGIONS.findIndex(v =>
			ApplicationModel.Region.Reference.equal(v, args.visibleRegion)
		);
		const regionsWithSameOrLowerPriority = PRIORITY_ORDERED_REGIONS.slice(indexOfVisibleRegion)
			.map(s =>
				args.regionInformation.find(re =>
					ApplicationModel.Region.Reference.equal(re.regionReference, s)
				)
			)
			.reduce<RegionInformation[]>((list, element) => {
				if (element !== undefined) {
					list.push(element);
				}
				return list;
			}, []);
		const regionsWithHigherPriority: RegionInformation[] = PRIORITY_ORDERED_REGIONS.slice(
			0,
			indexOfVisibleRegion
		)
			.map(s =>
				args.regionInformation.find(re =>
					ApplicationModel.Region.Reference.equal(re.regionReference, s)
				)
			)
			.reduce<RegionInformation[]>((list, element) => {
				if (element !== undefined) {
					list.push(element);
				}
				return list;
			}, []);

		const viewsToRemove = calculateViewsToRemove(
			regionsWithSameOrLowerPriority,
			args.activityIdMap
		);
		const remainingViews = calculateRemainingViews(
			viewsToRemove,
			args.listOfViews,
			regionsWithHigherPriority
		);

		if (remainingViews.length === 0) {
			return undefined;
		}

		const remainingActivityIds = Object.keys(args.activityIdMap).filter(
			aId => viewsToRemove.find(view => view.activityId === aId) === undefined
		);

		// Check if there are activities left which have no view and are no parent of any other remaining activity
		const containerActivityIds = remainingActivityIds.filter(
			activityId =>
				!isParentOfRemainingView(activityId, args.activityIdMap, remainingViews) &&
				!hasAView(activityId, remainingViews)
		);

		const activityIdsToCancel = Array.from(
			new Set([...containerActivityIds, ...viewsToRemove.map(v => v.activityId)])
		);

		const viewsInHigherRegions = remainingViews.filter(e =>
			viewIsInHigherRegion(e.regionReference, regionsWithHigherPriority)
		);
		// The most recent view from a higher region which has the same activity than one of the views which should be removed
		const lastRecentViewWithMatchingActivity = [...viewsInHigherRegions]
			.reverse()
			.find(view => activityIdsToCancel.find(id => id === view.activityId) !== undefined);

		// If such a view exists, return information to which region should be switched
		if (lastRecentViewWithMatchingActivity !== undefined) {
			return {
				type: "RegionSwitch",
				switchToRegion: lastRecentViewWithMatchingActivity.regionReference
			};
		} else {
			return {
				type: "CancelActivity",
				activitiesToCancel: activityIdsToCancel
			};
		}
	}
};

/**
 * Determine the views that should be removed
 * The back-button should bring the user back to the "previous" views (views that are logical arranged before).
 * This means we need to remove the currently visible regions and regions
 * that are logical after the currently visible views.
 * Exception: We want to keep views that where created earlier,
 * this needs to determined using the initiating dependency
 */
function calculateViewsToRemove(
	regionsWithSameOrLowerPriority: RegionInformation[],
	activityIdMap: ActivityIdMap
): View[] {
	// List of views which are visible inside the current region or
	// are in a following region (= region with lower priority).
	const visibleViews: View[] = [];
	for (const region of regionsWithSameOrLowerPriority) {
		const clearedAfter = region.clearedAfter ?? -1;
		const views = region.views.slice(clearedAfter + 1);
		visibleViews.push(...views);
	}

	// Do not remove views for which the activity is an initiating activity of any other view
	const viewsToRemove = visibleViews.filter(
		v1 => visibleViews.find(v2 => activityIdMap[v2.activityId] === v1.activityId) === undefined
	);

	return viewsToRemove;
}

/**
 * Determine the views which are still present after we remove all entries from the list of all directives, which:
 * 	* are not in "viewsToRemove" OR
 *  * are in a higher region
 * Sort them by the priority of their region
 */
function calculateRemainingViews(
	viewsToRemove: View[],
	listOfViews: ReadonlyArray<ViewWithRegionReference>,
	regionsWithHigherPriority: RegionInformation[]
): ViewWithRegionReference[] {
	return listOfViews
		.filter(e => shouldEntryRemain(viewsToRemove, e, regionsWithHigherPriority))
		.sort((a, b) => {
			const aIndex = regionsWithHigherPriority.findIndex(e =>
				ApplicationModel.Region.Reference.equal(a.regionReference, e.regionReference)
			);
			const bIndex = regionsWithHigherPriority.findIndex(e =>
				ApplicationModel.Region.Reference.equal(b.regionReference, e.regionReference)
			);

			return aIndex - bIndex;
		});
}

function shouldEntryRemain(
	viewsToRemove: View[],
	viewAdd: ViewWithRegionReference,
	regionsWithHigherPriority: RegionInformation[]
): boolean {
	/**
	 * Views in a higher region can have the same activity than a view in viewsToRemove,
	 * but we want to keep them
	 */
	if (viewIsInHigherRegion(viewAdd.regionReference, regionsWithHigherPriority)) {
		return true;
	}

	// Activity of view is in "viewsToRemove"
	if (viewsToRemove.find(v => v.activityId === viewAdd.activityId) !== undefined) {
		return false;
	}

	return true;
}

function viewIsInHigherRegion(
	region: ApplicationModel.Region.Reference,
	regionsWithHigherPriority: RegionInformation[]
): boolean {
	return regionsWithHigherPriority.some(r =>
		ApplicationModel.Region.Reference.equal(region, r.regionReference)
	);
}

function isParentOfRemainingView(
	activityId: string,
	activityIdMap: ActivityIdMap,
	remainingViews: ViewWithRegionReference[]
): boolean {
	return remainingViews.some(view => activityIdMap[view.activityId] === activityId);
}

function hasAView(activityId: string, remainingViews: ViewWithRegionReference[]): boolean {
	return remainingViews.find(view => view.activityId === activityId) !== undefined;
}
