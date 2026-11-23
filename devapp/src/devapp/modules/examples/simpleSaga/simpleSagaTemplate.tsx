// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ComponentType, JSX } from "react";
import { useDispatch } from "react-redux";

import type { View } from "@com.mgmtp.a12.client/client-core";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";

import { initiateSimpleSaga } from "./simpleSagaActions.js";

interface SimpleSagaTemplateProps extends View {
	readonly name: string;
	readonly StatusComponent: ComponentType<SimpleSagaTemplateProps>;
}

export function SimpleSagaTemplate(props: SimpleSagaTemplateProps): JSX.Element {
	const dispatch = useDispatch();

	return (
		<ActionContentbox
			listenToNavigationContext
			headingElements={<ContentBoxElements.Title text={props.name} ariaLevel={props.ariaLevel} />}
		>
			<p>This is a demonstration of using Redux sagas for multi step background processing.</p>
			<p>
				The status of the saga doing the background processing is shown on the left in the sidebar.
			</p>

			<p>Click this button to start a saga:</p>
			<Button
				primary
				onClick={() => {
					dispatch(initiateSimpleSaga({ activityId: props.activityId }));
				}}
			>
				Start Saga
			</Button>

			<props.StatusComponent {...props} />

			<p>Cool Things to check out while the saga is running:</p>
			<ul>
				<li>
					You can start multiple sagas (by clicking on the &quot;Start Saga&quot; button).
					<br />
					Always just one saga will run. Each saga has to acquire a lock before it can run.
					<br />
					Another saga called &quot;acquireActivityLock&quot; is used for this.
					<br />
					<br />
					You can see more information about the acquireActivityLock-saga in the console, using the
					filter &quot;SAGA:&quot;.
					<br />
					The following information are logged:
					<ul>
						<li> The saga started</li>
						<li> The saga requests the lock</li>
						<li> The saga acquired the lock</li>
						<li> The saga stopped, because the activity is no longer in the state</li>
					</ul>
				</li>
			</ul>
		</ActionContentbox>
	);
}
