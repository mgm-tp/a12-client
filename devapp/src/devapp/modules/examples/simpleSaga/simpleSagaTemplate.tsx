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
 * 1. Open-Source License – EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

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
