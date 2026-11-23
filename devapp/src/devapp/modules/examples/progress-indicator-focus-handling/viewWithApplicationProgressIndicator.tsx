// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useSelector } from "react-redux";

import type { View } from "@com.mgmtp.a12.client/client-core";
import { ActivitySelectors } from "@com.mgmtp.a12.client/client-core";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";

export function ViewWithApplicationProgressIndicator(props: View): JSX.Element {
	const loadingState = useSelector(ActivitySelectors.loadingStateById(props.activityId));

	return (
		<ActionContentbox
			listenToNavigationContext
			headingElements={
				<ContentBoxElements.Title
					text="View with application progress indicator"
					ariaLevel={props.ariaLevel}
				/>
			}
		>
			<p>Loading State: {loadingState}</p>
			<Button disabled={loadingState !== "loaded"}>
				Interactive element which should get focus on the first tab
			</Button>
		</ActionContentbox>
	);
}
