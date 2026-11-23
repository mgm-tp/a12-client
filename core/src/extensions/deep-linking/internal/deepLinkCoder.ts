// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
