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
import { useDispatch } from "react-redux";

import type { ViewNGProps } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions } from "@com.mgmtp.a12.client/client-core";
import { Button, ActionContentbox, ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core";

export function DataEditorFeature(props: ViewNGProps): JSX.Element {
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
