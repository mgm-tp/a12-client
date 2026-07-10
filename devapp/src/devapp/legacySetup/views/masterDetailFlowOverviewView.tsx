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
import { useCallback } from "react";
import { useDispatch } from "react-redux";

import type { ViewNGProps } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions } from "@com.mgmtp.a12.client/client-core";
import {
	Button,
	addPrefix,
	ActionContentbox,
	ContentBoxElements
} from "@com.mgmtp.a12.widgets/widgets-core";

export interface MasterDetailFlowRecord {
	readonly id: string;
	readonly name: string;
	readonly status: "Active" | "Pending" | "Completed";
	readonly category: string;
	readonly createdAt: string;
	readonly description: string;
}

export const SAMPLE_RECORDS: readonly MasterDetailFlowRecord[] = [
	{
		id: "record-1",
		name: "User Registration",
		status: "Active",
		category: "Onboarding",
		createdAt: "2026-01-15",
		description: "New user registration with email verification and role assignment."
	},
	{
		id: "record-2",
		name: "Password Reset",
		status: "Pending",
		category: "Security",
		createdAt: "2026-02-03",
		description: "Password reset via recovery email link."
	},
	{
		id: "record-3",
		name: "Profile Update",
		status: "Completed",
		category: "Account",
		createdAt: "2026-02-28",
		description: "User profile information update including address and contact details."
	}
];

interface RecordRowProps {
	readonly record: MasterDetailFlowRecord;
	readonly onSelect: (id: string) => void;
}

function RecordRow({ record, onSelect }: RecordRowProps): JSX.Element {
	const handleClick = useCallback(() => onSelect(record.id), [onSelect, record.id]);
	return (
		<tr>
			<td>{record.name}</td>
			<td>{record.category}</td>
			<td>{record.status}</td>
			<td>{record.createdAt}</td>
			<td>
				<Button secondary onClick={handleClick}>
					View Details
				</Button>
			</td>
		</tr>
	);
}

export function MasterDetailFlowOverviewView({ activityId, ariaLevel }: ViewNGProps): JSX.Element {
	const dispatch = useDispatch();

	const onViewDetails = useCallback(
		(recordId: string) => {
			dispatch(
				ActivityActions.create({
					activityDescriptor: { section: "master-detail-flow", mode: "detail", recordId },
					loadingState: "without",
					initiatingActivityId: activityId
				})
			);
		},
		[activityId, dispatch]
	);

	return (
		<ActionContentbox
			headingElements={
				<ContentBoxElements.Title
					text="Master-Detail-Flow — Overview (AppModel)"
					ariaLevel={ariaLevel ?? 1}
				/>
			}
		>
			<div className={addPrefix("-u-text-base")}>
				<p>
					This example demonstrates the classic AppModel approach using a master-detail layout.
					Selecting a record creates a new activity with the <code>recordId</code> embedded in its
					descriptor — passed at creation time and read back by the detail view without a separate
					data loading step.
				</p>

				<p>Key AppModel features shown here:</p>
				<ul>
					<li>
						Two scenes in one flow: <code>master-detail-flow.overview.scene</code> (this view) and{" "}
						<code>master-detail-flow.detail.scene</code> (detail panel)
					</li>
					<li>
						Detail scene matches on <code>mode&nbsp;=&nbsp;&quot;detail&quot;</code>; overview scene
						is the fallback (more specific scenes are listed first in the flow)
					</li>
					<li>
						MasterDetail layout: the detail panel opens alongside this overview inside the CONTENT
						region
					</li>
					<li>
						<code>initiatingActivityId</code>: the detail activity is linked back to this overview
						activity
					</li>
				</ul>

				<table className={addPrefix("-u-margin-t-lg -u-width-full")}>
					<thead>
						<tr>
							<th>Name</th>
							<th>Category</th>
							<th>Status</th>
							<th>Created</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{SAMPLE_RECORDS.map(record => (
							<RecordRow key={record.id} record={record} onSelect={onViewDetails} />
						))}
					</tbody>
				</table>
			</div>
		</ActionContentbox>
	);
}
