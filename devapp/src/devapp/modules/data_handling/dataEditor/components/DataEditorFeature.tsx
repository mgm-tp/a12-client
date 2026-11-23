// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useDispatch } from "react-redux";

import type { View } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions } from "@com.mgmtp.a12.client/client-core";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";

export default function DataEditorFeature(props: View): JSX.Element {
	const dispatch = useDispatch();

	return (
		<ActionContentbox
			headingElements={<ContentBoxElements.Title text="Data Editor" ariaLevel={props.ariaLevel} />}
		>
			<p>
				This is a demonstration of an activity that loads its data from another &quot;source&quot;
				activity using DataEditor.
			</p>
			<Button
				primary
				onClick={() =>
					dispatch(
						ActivityActions.create({
							activityDescriptor: { model: "BookAuthor-document" },
							loadingState: "missing"
						})
					)
				}
			>
				Open source activity
			</Button>
		</ActionContentbox>
	);
}
