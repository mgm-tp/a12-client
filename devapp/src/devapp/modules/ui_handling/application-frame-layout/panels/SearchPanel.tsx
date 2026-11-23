// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useContext, useState } from "react";
import { useDispatch } from "react-redux";

import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";
import { Button } from "@com.mgmtp.a12.widgets/widgets-core/lib/button/main/button.view.js";
import { addPrefix } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/utils.js";
import { Icon } from "@com.mgmtp.a12.widgets/widgets-core/lib/icon/main/icon.view.js";
import { TextLineStateless } from "@com.mgmtp.a12.widgets/widgets-core/lib/input/text-line/main/template/text-line.tpl.view.js";
import { LayoutGrid } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/layout-grid/main/layout-grid.view.js";

import { SimpleOverviewActions } from "../../../../mocks/SimpleOverview/actions.js";

export function SearchPanel(props: { activityId: string }): JSX.Element {
	const dispatch = useDispatch();
	const localizer = useContext(LocalizerContext).localizer;
	const [value, setValue] = useState("");

	function onQueryChanged(filterValue: string): void {
		dispatch(
			SimpleOverviewActions.onQueryParametersChanged({
				activityId: props.activityId,
				fullTextSearch: filterValue
			})
		);
	}

	return (
		<LayoutGrid.Grid className={addPrefix("-u-padding-sm")}>
			<LayoutGrid.Row layoutConfig={{ layout: { sm: [12], md: [12], lg: [12] } }}>
				<LayoutGrid.Column>
					<TextLineStateless
						label={localizer({ key: "examples.ui-handling.tabPanel.searchPanel.inputLabel" })}
						onChange={e => {
							setValue(e.target.value);
						}}
						onBlur={() => onQueryChanged(value)}
						value={value}
						addonAfter={
							<Button
								title={localizer({ key: "examples.ui-handling.tabPanel.searchPanel.clearButton" })}
								icon={<Icon>close</Icon>}
								onClick={() => {
									setValue("");
									onQueryChanged("");
								}}
							/>
						}
					/>
				</LayoutGrid.Column>
			</LayoutGrid.Row>
			<LayoutGrid.Row layoutConfig={{ layout: { sm: [12], md: [12], lg: [12] } }}>
				<LayoutGrid.Column>
					<Button
						primary
						label={localizer({ key: "examples.ui-handling.tabPanel.searchPanel.searchButton" })}
						onClick={() => onQueryChanged(value)}
					/>
				</LayoutGrid.Column>
			</LayoutGrid.Row>
		</LayoutGrid.Grid>
	);
}
