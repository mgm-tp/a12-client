// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ComponentType } from "react";
import { useSelector } from "react-redux";

import { ActivitySelectors } from "../../../activity/internal/selectors.js";
import type { View } from "../../../view/internal/view.js";
import { ViewViews } from "../../../view/internal/views.js";

const IndicatorStyles = { height: "100%", width: "100%" };

function ProgressIndicator(props: View.ProgressComponentProvider.PropsType) {
	const busy = useSelector(ActivitySelectors.busy(props.activityId));

	return (
		<ViewViews.ProgressIndicator progress={busy ? "loading" : "none"} style={IndicatorStyles}>
			{props.children}
		</ViewViews.ProgressIndicator>
	);
}

/** @internal */
export function DefaultProgressComponentProvider(): ComponentType<View.ProgressComponentProvider.PropsType> {
	return ProgressIndicator;
}
