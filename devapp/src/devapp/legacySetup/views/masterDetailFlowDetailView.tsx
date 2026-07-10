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
import { useDispatch, useSelector } from "react-redux";

import type { ViewNGProps } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions, ActivitySelectors } from "@com.mgmtp.a12.client/client-core";
import {
	ButtonGroup,
	Button,
	addPrefix,
	ActionContentbox,
	ContentBoxElements,
	ButtonGroupContainer
} from "@com.mgmtp.a12.widgets/widgets-core";

import type { MasterDetailFlowRecord } from "./masterDetailFlowOverviewView.js";
import { SAMPLE_RECORDS } from "./masterDetailFlowOverviewView.js";

interface RecordContentProps {
	readonly record: MasterDetailFlowRecord;
	readonly descriptor: Record<string, string> | undefined;
}

function RecordContent({ record, descriptor }: RecordContentProps): JSX.Element {
	return (
		<div className={addPrefix("-u-text-base")}>
			<p>
				This view received its context via the activity descriptor. The <code>recordId</code> was
				embedded as <strong>initial data</strong> when the detail activity was created from the
				overview — no separate data loading step is needed.
			</p>

			<dl className={addPrefix("-u-margin-t-md")}>
				<dt>
					<strong>Name</strong>
				</dt>
				<dd>{record.name}</dd>

				<dt>
					<strong>Category</strong>
				</dt>
				<dd>{record.category}</dd>

				<dt>
					<strong>Status</strong>
				</dt>
				<dd>{record.status}</dd>

				<dt>
					<strong>Created</strong>
				</dt>
				<dd>{record.createdAt}</dd>

				<dt>
					<strong>Description</strong>
				</dt>
				<dd>{record.description}</dd>
			</dl>

			<div
				className={addPrefix(
					"-u-margin-t-lg -u-padding-md -u-background-blue-light -u-border-radius-md"
				)}
			>
				<strong>Activity descriptor (initial data):</strong>
				<br />
				<code>{JSON.stringify(descriptor)}</code>
			</div>
		</div>
	);
}

export function MasterDetailFlowDetailView({ activityId, ariaLevel }: ViewNGProps): JSX.Element {
	const dispatch = useDispatch();

	const descriptor = useSelector(
		ActivitySelectors.activityPropById(activityId, a => a.descriptor)
	) as Record<string, string> | undefined;

	const currentIndex = SAMPLE_RECORDS.findIndex(r => r.id === descriptor?.["recordId"]);
	const record = currentIndex !== -1 ? SAMPLE_RECORDS[currentIndex] : undefined;

	const onClose = useCallback(() => {
		dispatch(ActivityActions.cancelRequested({ activityIds: [activityId] }));
	}, [activityId, dispatch]);

	return (
		<ActionContentbox
			listenToNavigationContext
			headingElements={
				<ContentBoxElements.Title
					text={record ? `Detail: ${record.name}` : "Detail"}
					ariaLevel={ariaLevel ?? 2}
				/>
			}
			footer={
				<ContentBoxElements.Footer>
					<ButtonGroupContainer>
						<ButtonGroup alignment="right">
							<Button destructive onClick={onClose}>
								Close
							</Button>
						</ButtonGroup>
					</ButtonGroupContainer>
				</ContentBoxElements.Footer>
			}
		>
			{record !== undefined ? (
				<RecordContent record={record} descriptor={descriptor} />
			) : (
				<p>No record selected.</p>
			)}
		</ActionContentbox>
	);
}
