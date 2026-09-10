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

import type { Action } from "typescript-fsa";

import { LoggerFactory } from "@com.mgmtp.a12.utils/utils-logging/lib/factory.js";

import type { ActivityMap } from "../../../../activity/index.js";
import type { ActivityActions } from "../../../../activity/internal/actions.js";
import type { Activity } from "../../../../activity/internal/activity.js";
import type { DataProvider } from "../../../../data/internal/DataProvider.js";

const logger = LoggerFactory.getLogger("core/application");

/** @internal */
export interface CallDescriptor {
	readonly dataProvider: DataProvider;
	readonly config: DataProvider.ProvideDataConfig;
}

interface PayloadTypes {
	readonly load: ActivityActions.LoadDataPayload;
	readonly save: ActivityActions.SaveDataPayload | ActivityActions.CommitPayload;
	readonly delete: ActivityActions.RemoveDataPayload;
}

interface Params<T extends DataProvider.Operation> {
	readonly operation: T;
	/**
	 * The payload of the action that triggered this operation
	 */
	readonly action: Action<PayloadTypes[T]>;
	readonly dataProviders: DataProvider[];
	readonly activities: ActivityMap;
	/**
	 * Whether the data holder of the activity is "relevant" for this operation
	 */
	isRelevant: (dh: Activity.DataHolder) => boolean;
	/**
	 * Additional data ("details") that will be passed to the data provider
	 */
	readonly additionalDetails?: (
		handledDhs: Activity.DataHolder[]
	) => Extract<DataProvider.ProvideDataConfig, { operation: T }>["details"];
	/**
	 * Whether unhandled data holders should be considered an error
	 */
	readonly assertAllHandled?: boolean;
}

/** @internal */
export function createCallDescriptors<O extends DataProvider.Operation>({
	operation,
	isRelevant,
	dataProviders,
	activities,
	additionalDetails,
	assertAllHandled,
	action
}: Params<O>): CallDescriptor[] {
	const callDescriptors: CallDescriptor[] = [];

	const { activityId, ...payloadRest } = action.payload;

	const activity = activities[activityId];

	let relevantDataHolders = activity?.dataHolders.filter(isRelevant) ?? [];

	for (const dp of dataProviders) {
		const { handled = [], rest = [] } = Object.groupBy(relevantDataHolders, canHandle(dp));

		if (handled.length > 0) {
			logger.log(
				`${operation}: data provider ${dp.name} handles ${handled.length} data holder(s).`
			);

			callDescriptors.push(asDescriptor(dp, handled));
		}

		relevantDataHolders = rest;
	}

	if (assertAllHandled && relevantDataHolders.length > 0) {
		throw new Error(
			`There is still data to ${operation} for ${relevantDataHolders.length} data holder.`
		);
	}

	return callDescriptors;

	function canHandle(dp: DataProvider): (dh: Activity.DataHolder) => PropertyKey {
		return dataHolder =>
			dp.canHandle({
				activityId,
				operation,
				dataHolder,
				activities,
				action
			})
				? "handled"
				: "rest";
	}

	function asDescriptor(
		dataProvider: DataProvider,
		dataHolders: Activity.DataHolder[]
	): CallDescriptor {
		return {
			dataProvider,
			config: {
				activityId,
				operation,
				dataHolders,
				details: additionalDetails?.(dataHolders) ?? payloadRest
			} as DataProvider.ProvideDataConfig
		};
	}
}
