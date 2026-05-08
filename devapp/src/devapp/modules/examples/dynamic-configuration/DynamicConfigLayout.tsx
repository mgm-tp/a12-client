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

import type { LayoutPropsNG, Selector, ViewNG } from "@com.mgmtp.a12.client/client-core";
import type { SliderMark } from "@com.mgmtp.a12.widgets/widgets-core/lib/experimental/input/slider/main/slider.api.js";
import { Slider } from "@com.mgmtp.a12.widgets/widgets-core/lib/experimental/input/slider/main/slider.view.js";
import type { LayoutGridProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/layout-grid/main/layout-grid.api.js";
import { LayoutGrid } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/layout-grid/main/layout-grid.view.js";

import type { UIState } from "./uiState.js";
import { defaultState, setColumnsAction, uiSlice } from "./uiState.js";

interface DynamicLayoutProps extends LayoutPropsNG {
	readonly activityId: string;
}

export function DynamicLayoutComponent(props: DynamicLayoutProps): JSX.Element {
	return (
		<>
			<ColsSlider activityId={props.activityId} />
			<DynamicGrid activityId={props.activityId} views={props.views} />
		</>
	);
}

function uiSliceOrDefault(activityId?: string): Selector<UIState> {
	return state =>
		activityId ? (uiSlice.selector(activityId)(state) ?? defaultState) : defaultState;
}

function ColsSlider(props: { activityId: string }) {
	const { activityId } = props;
	const { columns } = useSelector(uiSliceOrDefault(activityId)) ?? defaultState;

	const options: SliderMark[] = [1, 2, 3].map(sliderOption);

	const dispatch = useDispatch();
	const onChange = (value: string) => {
		const newColumns = Number(value) as 1 | 2 | 3;
		dispatch(setColumnsAction({ activityId, columns: newColumns }));
	};

	return <Slider value={`${columns}`} marks={options} onChange={onChange} label="# of columns" />;
}

function sliderOption(value: number): SliderMark {
	return {
		value: `${value}`
	};
}

interface DynamicGridProps {
	readonly activityId: string;
	readonly views: ViewNG[];
}

function DynamicGrid(props: DynamicGridProps) {
	const { columns } = useSelector(uiSliceOrDefault(props.activityId));
	const size = (12 / columns) as LayoutGridProps.ColumnNumber;

	const rows = sliceIntoChunks(props.views, columns);

	return (
		<LayoutGrid.Grid>
			{rows.map((row, i) => (
				<Row views={row} key={i} size={size} />
			))}
		</LayoutGrid.Grid>
	);
}

interface RowProps {
	readonly size: LayoutGridProps.ColumnNumber;
	readonly views: ViewNG[];
}

function Row(props: RowProps) {
	return (
		<LayoutGrid.Row>
			{props.views.map((v, i) => {
				return (
					<LayoutGrid.Column key={i} size={{ lg: props.size }}>
						<v.Component {...v.props} />
					</LayoutGrid.Column>
				);
			})}
		</LayoutGrid.Row>
	);
}

function sliceIntoChunks<T>(arr: T[], size: number) {
	const result: T[][] = [];
	let curChunk: T[];
	for (let i = 0; i < arr.length; i++) {
		if (i % size === 0) {
			curChunk = new Array<T>();
			result.push(curChunk);
		}
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		curChunk!.push(arr[i]);
	}
	return result;
}
