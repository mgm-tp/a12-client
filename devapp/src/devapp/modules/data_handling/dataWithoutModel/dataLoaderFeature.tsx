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

import type { JSX } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { Activity, View } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions, ActivitySelectors } from "@com.mgmtp.a12.client/client-core";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";

const overviewDescriptor: Activity.Descriptor = {
	feature: "DataLoaderWithoutModel"
};

const documentDescriptor: Activity.Descriptor = {
	...overviewDescriptor,
	instance: "5"
};

export function DataLoaderFeature(props: View): JSX.Element {
	const dispatch = useDispatch();

	const activeDocumentActivities = useSelector(
		ActivitySelectors.activitiesByDescriptor(documentDescriptor)
	);
	const activeOverviewActivities = useSelector(
		ActivitySelectors.activitiesByDescriptor(overviewDescriptor)
	);

	function cancelActivesAndCreate(activityDescriptor: Activity.Descriptor): void {
		[...activeOverviewActivities, ...activeDocumentActivities].forEach(({ id }) =>
			dispatch(ActivityActions.cancel({ activityId: id }))
		);

		dispatch(
			ActivityActions.create({
				activityDescriptor
			})
		);
	}

	return (
		<ActionContentbox
			headingElements={<ContentBoxElements.Title text="Data Loader" ariaLevel={props.ariaLevel} />}
		>
			<p>
				This feature demonstrates, that data can be loaded, even if A12 models are not specified in
				the appmodel.
			</p>
			<p>
				If you click the following button, it will start an overview activity, which triggers a
				custom data loader, which loads A12 independent data.
			</p>
			<Button primary onClick={() => cancelActivesAndCreate(overviewDescriptor)}>
				Open overview activity
			</Button>

			<br />
			<br />

			<p>
				If you click the following button, it will start a document activity, which triggers a
				custom data loader, which loads A12 independent data.
			</p>
			<Button primary onClick={() => cancelActivesAndCreate(documentDescriptor)}>
				Open document activity
			</Button>
			<br />
			<br />
		</ActionContentbox>
	);
}
