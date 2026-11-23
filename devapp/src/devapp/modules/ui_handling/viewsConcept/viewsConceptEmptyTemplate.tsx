// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";

import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";

export function ViewsConceptEmpty(props: {
	activityId: string;
	readonly ariaLevel?: number;
}): JSX.Element {
	return (
		<ActionContentbox
			listenToNavigationContext
			headingElements={<ContentBoxElements.Title text="Empty View" ariaLevel={props.ariaLevel} />}
		>
			<p>This is an example ui component to demonstrate the views concept.</p>
			<p>Below, the ID of the underlying activity is shown.</p>
			<p>All views share the same activity.</p>
			<p>But each view has its own, dedicated ui component.</p>
			<ul>
				<li>activity: {props.activityId}</li>
			</ul>
		</ActionContentbox>
	);
}
