// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { useSelector } from "react-redux";

import type { View } from "@com.mgmtp.a12.client/client-core";
import { ActivitySelectors } from "@com.mgmtp.a12.client/client-core";
// tag::generic[]
export function DisplayActivityLockView(props: View) {
	const activityId = props.activityId;

	// adding a dataHolder to this activity will cause a re-render!
	const activity = useSelector(ActivitySelectors.activityById(activityId));

	return <div>{activity?.lock ? "locked" : "unlocked"}</div>;
}
// end::generic[]
// tag::specific[]
export function DisplayActivityLockView2(props: View) {
	const activityId = props.activityId;

	// only changes to the lock property cause a re-render
	const lock = useSelector(ActivitySelectors.activityPropById(activityId, a => a.lock));

	return <div>{lock ? "locked" : "unlocked"}</div>;
}
// end::specific[]
