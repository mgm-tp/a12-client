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

import type { Activity, ViewNGProps } from "@com.mgmtp.a12.client/client-core";
import { ActivityActions, ActivitySelectors } from "@com.mgmtp.a12.client/client-core";
import { ButtonGroup } from "@com.mgmtp.a12.widgets/widgets-core/lib/button-group/main/button-group.view.js";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { addPrefix } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/utils.js";
import { Icon } from "@com.mgmtp.a12.widgets/widgets-core/lib/icon/main/icon.view.js";
import { Checkbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/input/checkbox/main/checkbox.view.js";
import type { LayoutGridProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/layout-grid/main/layout-grid.api.js";
import { LayoutGrid } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/layout-grid/main/layout-grid.view.js";
import { ProgressIndicator } from "@com.mgmtp.a12.widgets/widgets-core/lib/progress-indicator/main/progress-indicator.view.js";
import { Status } from "@com.mgmtp.a12.widgets/widgets-core/lib/status/main/status.view.js";

import { toggleDirty, toggleUpdateInstance } from "./actions.js";

const { Grid, Row, Column } = LayoutGrid;
const COLUMN_SIZE = { lg: 6 } satisfies LayoutGridProps.ColumnSize;

export function DataHolderView({ activityId }: ViewNGProps): JSX.Element {
	const dataholderIds = useSelector(
		ActivitySelectors.activityPropById(activityId, a =>
			a.dataHolders.flatMap(dh => dh.descriptor.id ?? [])
		),
		(x, y) => x?.length === y?.length && (x?.every((id, idx) => id === y?.[idx]) ?? true)
	);

	const descriptor = useSelector(ActivitySelectors.activityPropById(activityId, a => a.descriptor));

	return (
		<>
			<h3>Activity descriptor:</h3>
			<Descriptor descriptor={descriptor} />
			<h3>Activity dataholders:</h3>
			<Grid>
				{Array.from({ length: Math.ceil(dataholderIds?.length ?? 0 / 2) }, (_, index) =>
					dataholderIds?.slice(index * 2, index * 2 + 2)
				).map((idTuples, tupleIndex) => (
					<Row key={tupleIndex}>
						{idTuples?.map(id => (
							<DataHolderColumn key={id} activityId={activityId} dataholderId={id} />
						))}
					</Row>
				))}
			</Grid>
		</>
	);
}

interface DataHolderColumnProps {
	readonly activityId: string;
	readonly dataholderId: string;
}

function DataHolderColumn({ dataholderId, activityId }: DataHolderColumnProps): JSX.Element | null {
	const dispatch = useDispatch();

	const dh = useSelector(
		ActivitySelectors.activityPropById(activityId, a =>
			a.dataHolders.find(dh => dh.descriptor.id === dataholderId)
		)
	);

	const isDefault = dataholderId === "0";

	return dh ? (
		<Column size={COLUMN_SIZE}>
			<div className={addPrefix("-u-flex -u-flex-col -u-padding-xs -u-border -u-border-solid")}>
				<Descriptor descriptor={dh.descriptor} />
				<div>
					<Status
						icon={<Icon title="Loading state">sync</Icon>}
						variant="info"
						className={addPrefix("-u-margin-r-xs")}
					>
						{dh.loadingState}
					</Status>
					<Status icon={<Icon title="Saving state">save</Icon>} variant="info">
						{dh.savingState}
					</Status>
				</div>
				<div className={addPrefix("-u-flex -u-margin-t-xs")}>
					<Checkbox
						checked={dh.dirty}
						onChange={() => dispatch(toggleDirty({ activityId, dataholderIds: [dataholderId] }))}
						label="Is dirty"
					/>
					{isDefault && (
						<Checkbox
							checked={!!dh.slices.updateInstance}
							onChange={() => dispatch(toggleUpdateInstance({ activityId }))}
							label="Update instance on next save"
						/>
					)}
				</div>
				<ButtonGroup>
					<Button
						label="Load"
						onClick={() =>
							dispatch(
								ActivityActions.loadData({
									activityId,
									dataHolderDescriptors: [dh.descriptor]
								})
							)
						}
					/>
					<Button
						label="Save"
						onClick={() =>
							dispatch(
								ActivityActions.save.started({
									activityId,
									dataHolderDescriptors: [dh.descriptor]
								})
							)
						}
					/>
					{!isDefault && (
						<Button
							label="Delete"
							destructive
							onClick={() =>
								dispatch(
									ActivityActions.removeData({
										activityId,
										instanceId: dataholderId
									})
								)
							}
						/>
					)}
				</ButtonGroup>
				{dh.busy && (
					<ProgressIndicator
						useLoadingDots
						label={`${dh.loadingState === "loading" ? dh.loadingState : dh.savingState === "saving" ? dh.savingState : "deleting"}`}
					/>
				)}
			</div>
		</Column>
	) : null;
}

function Descriptor(props: { descriptor?: Activity.Descriptor }): JSX.Element {
	return <pre className={addPrefix("-u-text-nano")}>{JSON.stringify(props.descriptor)}</pre>;
}
