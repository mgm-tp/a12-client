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

import type { Activity } from "../../../core/activity/index.js";
import { ActivityActions } from "../../../core/activity/index.js";

/**
 *
 * Has knowledge about the information encoded in a deep link.
 */
export interface DeepLinkCoder {
	/**
	 * Encodes information about activity in a deep link.
	 *
	 * Deep link should contain all information needed to restore the activity, so in a case that the activity
	 * loads its data from another one, a list of source activities is also provided.
	 *
	 * @param activity the activity
	 * @param sourceActivities the source activities
	 *
	 * @returns The deep link encoded as string
	 */
	encode(activity: Activity, sourceActivities: Activity[]): string;

	/**
	 * Creates list of actions to be dispatched from a deep link.
	 *
	 * @param deepLink the deep link
	 *
	 * @returns A list of push actions
	 */
	decode(deepLink: string): Action<ActivityActions.PushPayload>[];
}

/**
 * @internal
 *
 * Deep link coder that encodes only activity descriptor in the deep link.
 */
export class ActivityDescriptorBasedDeepLinkCoder implements DeepLinkCoder {
	encode(activity: Activity, sourceActivities: Activity[]): string {
		return [...sourceActivities, activity]
			.map(a => a.descriptor)
			.map(encode)
			.join("/");
	}

	decode(deepLink: string): Action<ActivityActions.PushPayload>[] {
		return deepLink
			.split("/")
			.filter(part => part)
			.map(decodeActivityLocation)
			.map(activityDescriptor => ActivityActions.create({ activityDescriptor }));
	}
}

function encode(descriptor: Activity.Descriptor): string {
	// need to access properties and their values in a generic way
	return Object.keys(descriptor)
		.filter(propName => descriptor[propName] !== undefined)
		.map(
			propName =>
				`${encodeURIComponent(propName)}:${encodeURIComponent(descriptor[propName] ?? "")}`
		)
		.join(",");
}

const activityLinkPattern = /([^:,]*):([^,]*)/g;
function decodeActivityLocation(activityLink: string): Activity.Descriptor {
	return JSON.parse(
		`{${decodeURIComponent(activityLink.replace(activityLinkPattern, '"$1":"$2"'))}}`
	);
}
