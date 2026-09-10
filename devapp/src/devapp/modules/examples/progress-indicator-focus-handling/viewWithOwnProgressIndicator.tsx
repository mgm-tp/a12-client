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
