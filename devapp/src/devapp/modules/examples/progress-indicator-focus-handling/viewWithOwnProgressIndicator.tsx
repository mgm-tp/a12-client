// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

import type { View } from "@com.mgmtp.a12.client/client-core";
import { ActivitySelectors } from "@com.mgmtp.a12.client/client-core";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { addPrefix } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/utils.js";
import { Typography } from "@com.mgmtp.a12.widgets/widgets-core/lib/typography/main/typography.view.js";

export function ViewWithOwnProgressIndicator(props: View): JSX.Element {
	const parentRef = useRef<HTMLElement | null>(null);

	const loadingState = useSelector(ActivitySelectors.loadingStateById(props.activityId));
	const ProgressComponent = props.ProgressComponent;

	const content = (
		<div className={addPrefix("-u-padding-sm")}>
			<Typography.Headline level={3} ariaLevel={props.ariaLevel}>
				View without ActionContentBox and with own progress indicator
			</Typography.Headline>
			<p>Loading State: {loadingState}</p>
			<Button disabled={loadingState !== "loaded"}>
				Interactive element which should get focus on the first tab
			</Button>
		</div>
	);

	useEffect(() => {
		if (loadingState === "loaded" && parentRef.current !== null) {
			parentRef.current.focus();
		}
	}, [loadingState]);

	return (
		<div
			className={addPrefix("-u-outline-none")}
			ref={r => {
				parentRef.current = r;
			}}
			tabIndex={-1}
		>
			{ProgressComponent && loadingState === "loading" ? (
				<ProgressComponent activityId={props.activityId}>{content}</ProgressComponent>
			) : (
				content
			)}
		</div>
	);
}

ViewWithOwnProgressIndicator.handleProgressIndicator = true;
