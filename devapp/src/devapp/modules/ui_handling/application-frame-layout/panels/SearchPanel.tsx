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
