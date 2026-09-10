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

import type { ActivityMap, ApplicationModel } from "@com.mgmtp.a12.client/client-core";
import { Activity, ActivitySelectors, ViewSelectors } from "@com.mgmtp.a12.client/client-core";

import type { SingleDocumentData } from "../mocks/SimpleForm/data.js";

import { assert } from "./step-tests-asserts.js";

/**
 * Collection of methods to assert step actions
 */
export namespace ActionAssertions {
	export interface BaseParameters {
		readonly state: object;
	}

	export function commit(state: object): void {
		numberOfActivities({ state, expectedNumberOfActivities: 1 });
		const latestActivity = ActivitySelectors.latestActivity()(state);
		if (latestActivity === undefined) {
			return;
		}
		assertMainActivity(latestActivity);
	}

	export function commitFailed(state: object): void {
		const lastActivity = ActivitySelectors.latestActivity()(state);
		if (lastActivity === undefined) {
			return;
		}
		assert.equal(ActivitySelectors.savingState(lastActivity).state, "error");
	}

	export interface DeepEqualParameters {
		readonly actual: unknown;
		readonly expected: unknown;
		readonly message?: string;
	}

	export function deepEqual(parameters: DeepEqualParameters): void {
		const message =
			parameters.message !== undefined ? parameters.message : "Objects are not deep-equal";
		assert.deepEqual(parameters.actual, parameters.expected, message);
	}

	export interface DocumentParameters extends BaseParameters {
		readonly state: object;
		readonly expectedInstanceName: string;
		readonly expectedData?: {};
	}

	export function openDocument(parameters: BaseParameters): void {
		numberOfActivities({
			state: parameters.state,
			expectedNumberOfActivities: 2
		});

		const lastActivity = ActivitySelectors.latestActivity()(parameters.state);

		if (lastActivity === undefined) {
			return;
		}

		if (lastActivity.initiatingActivityId !== undefined) {
			const parentActivity = ActivitySelectors.activityById(lastActivity.initiatingActivityId)(
				parameters.state
			);
			assertMainActivity(parentActivity);
		} else {
			assert.fail("Expected the activity to have an initiating activity id");
		}
	}

	export interface OpenRegionParameters extends BaseParameters {
		readonly expectedRegion: ApplicationModel.Region.Reference;
	}

	export function openRegion(parameters: OpenRegionParameters): void {
		const lastActivity = ActivitySelectors.latestActivity()(parameters.state);
		if (lastActivity === undefined) {
			return;
		}
		const regionViews = ViewSelectors.region(parameters.expectedRegion)(parameters.state).views;
		const lastActivityViewFound = regionViews.some(view => view.activityId === lastActivity.id);
		assert.isTrue(
			lastActivityViewFound,
			"No view opened in the expected region " +
				parameters.expectedRegion +
				" for the last activity."
		);
	}

	export interface EmptyRegionParameters extends BaseParameters {
		readonly emptyRegion: ApplicationModel.Region.Reference;
	}

	export function emptyRegion(parameters: EmptyRegionParameters): void {
		const regionViews = ViewSelectors.region(parameters.emptyRegion)(parameters.state).views;
		assert.isTrue(regionViews.length === 0);
	}

	export interface NumberOfActivitiesParameters extends BaseParameters {
		readonly expectedNumberOfActivities?: number;
	}

	export function numberOfActivities(parameters: NumberOfActivitiesParameters): void {
		const activities: ActivityMap = ActivitySelectors.activities()(parameters.state);
		assert.equal(
			Object.keys(activities).length,
			parameters.expectedNumberOfActivities,
			"Number of activities in state incorrect"
		);
	}

	export interface PartialDataParameters extends BaseParameters {
		readonly expectedResult: {} | null;
		dataEntrySelector(data: { [key: string]: {} }): object | undefined | null;
	}

	export function documentWithPartialData(parameters: PartialDataParameters): void {
		const lastActivity = ActivitySelectors.latestActivity()(parameters.state);
		if (lastActivity === undefined) {
			assert.fail("No active activity found!");
			return;
		}

		const data = Activity.findDefaultDataHolder(lastActivity)?.data as SingleDocumentData;
		const document: object | undefined = data.document;

		if (document !== undefined) {
			const actualData = parameters.dataEntrySelector(document as { [key: string]: {} });
			assert.deepEqual(actualData, parameters.expectedResult);
		}
	}
}

function assertMainActivity(lastActivity: Activity | undefined): void {
	if (lastActivity === undefined) {
		assert.fail("No last activity");
		return;
	}

	assert.equal(
		lastActivity.initiatingActivityId,
		undefined,
		"initiatingActivityId not undefined -  Activity should be a main activity"
	);

	const datasourceActivityId = Activity.findDefaultDataHolder(lastActivity)?.datasourceActivityId;
	assert.equal(
		datasourceActivityId,
		undefined,
		"datasourceActivityId not undefined -  Activity should be a main activity"
	);
}
