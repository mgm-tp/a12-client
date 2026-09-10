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
import { useDispatch, useSelector } from "react-redux";

import type { View } from "@com.mgmtp.a12.client/client-core";
import { ActivitySelectors } from "@com.mgmtp.a12.client/client-core";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { addPrefix } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/utils.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";

import { initiateCommitErrorHandlingSaga } from "./commitErrorHandlingSaga.js";

export default function CommitErrorHandling({ activityId, ariaLevel }: View): JSX.Element {
	const dispatch = useDispatch();

	const savingState = useSelector(ActivitySelectors.savingStateById(activityId));
	const loadingState = useSelector(ActivitySelectors.loadingStateById(activityId));

	const error = useSelector(ActivitySelectors.error(activityId));

	return (
		<ActionContentbox
			listenToNavigationContext
			headingElements={
				<ContentBoxElements.Title key="title" text="Commit Error Handling" ariaLevel={ariaLevel} />
			}
		>
			{savingState === "error" && error && (
				<div>
					<h1 className={addPrefix("-u-background-red")}>An error occurred</h1>
					<p>Error code: {error.errorCode}</p>
				</div>
			)}
			<div>
				<h1>Activity Details</h1>
				<p>Loading state: {loadingState}</p>
				<p>Saving state: {savingState}</p>
			</div>
			<div>
				<h1>Commit</h1>
				<p>Click the button below to commit the value.</p>
				<p>The requested commits will fail and succeed alternately.</p>
				<Button
					primary
					destructive
					onClick={() => dispatch(initiateCommitErrorHandlingSaga({ activityId }))}
					label="Commit"
				/>
			</div>
		</ActionContentbox>
	);
}
