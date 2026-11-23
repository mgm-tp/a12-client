// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useSelector } from "react-redux";

import type { View } from "@com.mgmtp.a12.client/client-core";
import { ActivitySelectors } from "@com.mgmtp.a12.client/client-core";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";

import type { CustomData } from "./customDocumentDataLoader.js";

export function OverviewWithoutModel(props: View): JSX.Element {
	const data = useSelector(ActivitySelectors.data(props.activityId)) as CustomData | undefined;

	return (
		<ActionContentbox
			listenToNavigationContext
			headingElements={
				<ContentBoxElements.Title text="Overview activity" ariaLevel={props.ariaLevel} />
			}
		>
			Data from the activity: <br />
			{data?.myCustomData ?? ""}
		</ActionContentbox>
	);
}
