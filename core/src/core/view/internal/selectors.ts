// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { ActivityMap } from "../../activity/internal/activityMap.js";
import { ActivitySelectors } from "../../activity/internal/selectors.js";
import { ApplicationModel } from "../../model/internal/ApplicationModel.js";
import { InternalModelSelectors, ModelSelectors } from "../../model/internal/selectors.js";
import type { Selector } from "../../store/internal/selectors.js";
import { shallowEqualize, shallowEqualizeWithoutArgs } from "../../store/internal/selectors.js";

import type { View } from "./view.js";

/**
 * All views related selectors.
 */
export namespace ViewSelectors {
	/**
	 * Returns the scene reference by a given activity id based on the
	 * activities present in the store.
	 */
	export function sceneReferenceByActivityId(
		activityId: string
	): Selector<ApplicationModel.SceneReference | undefined> {
		return state => {
			const activity = ActivitySelectors.activityById(activityId)(state);
			if (activity === undefined) {
				return undefined;
			}
			const relevantActivities = [...ActivitySelectors.initiatingPath(activityId)(state), activity];
			return InternalModelSelectors.sceneReferenceByActivities(relevantActivities)(state);
		};
	}

	/**
	 * Returns the ordered list of views based on the activities and model
	 * configuration present in the store.
	 */
	export const region = shallowEqualize(regionInternal, rr => rr.join("/"));
	function regionInternal(
		regionReference: ApplicationModel.Region.Reference
	): Selector<{ layout: ApplicationModel.Layout; views: View[] }> {
		const selectRegion = ModelSelectors.region(regionReference);
		const selectAllRegions = allRegions();

		return state => {
			const currentRegion = selectRegion(state);
			if (currentRegion === undefined) {
				throw new Error(`region not found: [${regionReference.join("/")}]`);
			}

			let views: View[] = [];
			let layout: ApplicationModel.Layout = currentRegion.layout;

			const renderingDirectives = selectAllRegions(state);
			for (const directive of [...renderingDirectives].reverse()) {
				if (!ApplicationModel.Region.Reference.equal(regionReference, directive.region)) {
					continue;
				}

				if (directive.type === "REGION_CLEAR") {
					layout = directive.layout ?? layout;
					break;
				}

				const activity = ActivitySelectors.activityById(directive.activityId)(state);
				if (activity === undefined) {
					continue;
				}

				views = [
					{
						name: directive.name,
						modelDescriptors: directive.models,
						constraints: directive.constraints,
						configuration: directive.configuration,
						activityId: activity.id
					},
					...views
				];
			}

			return { layout, views };
		};
	}

	/**
	 * @internal
	 */
	export interface ViewDescriptor extends View {
		readonly regionReference: ApplicationModel.Region.Reference;
	}

	/**
	 * @internal
	 *
	 * Returns the ordered list of {@link ViewDescriptor} based on the activities
	 * and model configuration present in the store.
	 */
	export function allViews(): Selector<ViewDescriptor[]> {
		const selectAllRegions = allRegions();

		return state => {
			let views: ViewDescriptor[] = [];

			const renderingDirectives = selectAllRegions(state);
			for (const directive of renderingDirectives) {
				if (directive.type === "REGION_CLEAR") {
					continue;
				}

				views = [
					...views,
					{
						name: directive.name,
						activityId: directive.activityId,
						regionReference: directive.region,
						modelDescriptors: directive.models,
						constraints: directive.constraints,
						configuration: directive.configuration
					}
				];
			}

			return views;
		};
	}

	/**
	 * @internal
	 * Returns the ordered list of {@link RenderingDirective} based on the activities and model
	 * configuration present in the store.
	 */
	export const allRegions = shallowEqualizeWithoutArgs(allRegionsInternal);
	function allRegionsInternal(): Selector<RenderingDirective[]> {
		return state => {
			const defaultRegion = ModelSelectors.applicationModel()(state).content.defaultRegion;

			/**
			 * The basic functionality of the selector is as follows. All directives
			 * of all activities will be processed from newest to oldest until all
			 * activities are processed.
			 * During the processing the relevant directives (based on
			 * phase (onExit, onEnter)) will result in the creation of directive information.
			 * Directive information can contain information about a view which is added to a region
			 * or a region clear.
			 * The selection of the directives based on a given activity is done by
			 * finding
			 * * the onEnter directives of an active case of the activity if given
			 * * the onEnter directives of the matching model scene if given
			 * * the onExit directives of the initiating activity of the given
			 *   activity if given and if the remaining list of activities that has
			 *   to be processed does not contain another activity with the same
			 *   initiating activity id
			 *
			 * Note: onEnter is always relevant. onExit is only relevant on creation
			 *       of the first child activity.
			 *
			 * TODO: It is no necessary anymore to start at the end of the list, because we do not stop
			 * when having a clear.
			 */
			let renderingDirectives: RenderingDirective[] = [];
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
				const sceneReference =
					InternalModelSelectors.sceneReferenceByActivities(relevantActivities)(state);

				if (sceneReference !== undefined) {
					const scene = InternalModelSelectors.sceneByReference(sceneReference)(state);
					let caze: ApplicationModel.Case | undefined;

					if (activity.case !== undefined) {
						caze = InternalModelSelectors.caze(activity.case)(scene);
					}

					if (caze === undefined && scene.defaultCase !== undefined) {
						caze = InternalModelSelectors.caze(scene.defaultCase)(scene);
					}

					if (
						caze !== undefined &&
						caze.sceneChange !== undefined &&
						caze.sceneChange.onEnter !== undefined
					) {
						// Add all views that are created by onEnter of the view of the activity
						renderingDirectives = [
							...normalizeDirectives(caze.sceneChange.onEnter, activity.id, defaultRegion),
							...renderingDirectives
						];
					}

					if (scene.sceneChange !== undefined && scene.sceneChange.onEnter !== undefined) {
						// Add all views that are created by onEnter of the scene of the activity
						renderingDirectives = [
							...normalizeDirectives(scene.sceneChange.onEnter, activity.id, defaultRegion),
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

				const initiatingSceneReference = InternalModelSelectors.sceneReferenceByActivities(
					relevantActivities.slice(0, relevantActivities.length - 1)
				)(state);

				if (initiatingSceneReference === undefined) {
					continue;
				}

				const initiatingScene =
					InternalModelSelectors.sceneByReference(initiatingSceneReference)(state);
				if (
					initiatingScene.sceneChange !== undefined &&
					initiatingScene.sceneChange.onExit !== undefined
				) {
					// Add all views that are created by onExit of the initiating activity
					renderingDirectives = [
						...normalizeDirectives(initiatingScene.sceneChange.onExit, activity.id, defaultRegion),
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
	 * Rendering directive extending a "VIEW_ADD"
	 * directive from the app-model
	 */
	export interface AddDirective extends Omit<ApplicationModel.Directive.Add, "region"> {
		readonly activityId: string;
		readonly region: ApplicationModel.Region.Reference;
	}

	/**
	 * @internal
	 *
	 * Rendering directive extending a "REGION_CLEAR"
	 * directive from the app-model
	 */
	export interface ClearDirective extends Omit<ApplicationModel.Directive.Clear, "region"> {
		readonly region: ApplicationModel.Region.Reference;
	}

	/**
	 * @internal
	 */
	export type RenderingDirective = AddDirective | ClearDirective;

	function normalizeDirectives(
		directives: ReadonlyArray<ApplicationModel.Directive>,
		activityId: string,
		defaultRegion: ApplicationModel.Region.Reference
	): ReadonlyArray<RenderingDirective> {
		return directives.map(directive => {
			return directive.type === "VIEW_ADD"
				? {
						...directive,
						activityId,
						region: directive.region ? directive.region : defaultRegion
					}
				: {
						...directive,
						region: directive.region ? directive.region : defaultRegion
					};
		});
	}
}
