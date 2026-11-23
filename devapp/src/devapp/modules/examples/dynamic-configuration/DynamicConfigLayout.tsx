// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
		// oxlint-disable-next-line typescript/no-non-null-assertion
		curChunk!.push(arr[i]);
	}
	return result;
}
