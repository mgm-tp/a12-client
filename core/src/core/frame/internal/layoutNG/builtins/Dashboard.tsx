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
import { useContext } from "react";

import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";
import { localizableFromLocalizationTreeMap } from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/LocalizableFactory.js";
import { addPrefix } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/utils.js";
import type { LayoutGridProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/layout-grid/main/layout-grid.api.js";

import { ClientWidgetMapContext } from "../../../../ClientWidgetMap.js";
import { LOCALE_RESOURCE_KEYS } from "../../../../locale/index.js";
import { ApplicationModel } from "../../../../model/internal/ApplicationModel.js";
import { DEFAULT_TRANSLATIONS } from "../../languages/index.js";

import type { LayoutPropsNG } from "../layoutPropsNG.js";

type ViewRenderer = (view: number) => JSX.Element | null;

interface DashboardLayoutComponentPropsNG extends LayoutPropsNG {
	readonly rows: ApplicationModel.Dashboard.Row[];
}

/**
 * @experimental
 * A layout component that uses the Grid widget to position the views.
 * Should only be used with `DynamicConfiguration`.
 *
 * NOTE: There is no export for the LayoutNG here as this component needs customizing anyway (to pass the rows)
 */
export function DashboardLayoutComponentNG({
	views,
	rows
}: DashboardLayoutComponentPropsNG): JSX.Element | null {
	const { localizer } = useContext(LocalizerContext);

	const { Grid, Row, Column } = useContext(ClientWidgetMapContext);

	if (views.length === 0) {
		return null;
	}

	let currentView = 0;

	return (
		<>
			<div className={addPrefix("-u-unseenButRead")} aria-level={1} role="heading">
				{localizer(
					localizableFromLocalizationTreeMap(
						LOCALE_RESOURCE_KEYS.dashboard.hiddenTitle,
						DEFAULT_TRANSLATIONS
					)
				)}
			</div>
			<Grid fitToParent>{rows.map(r => renderRow(r, render))}</Grid>
		</>
	);

	function render(viewIndex: number): JSX.Element | null {
		const view = views.at(viewIndex);

		return view ? (
			<div className={addPrefix("-u-height-full")}>
				<view.Component {...view.props} />
			</div>
		) : null;
	}

	function renderRow(row: ApplicationModel.Dashboard.Row, viewRenderer: ViewRenderer): JSX.Element {
		return <Row key={currentView}>{row.columns.map(c => renderColumn(c, viewRenderer))}</Row>;
	}

	function renderColumn(
		c: ApplicationModel.Dashboard.ContainerColumn | ApplicationModel.Dashboard.Slot,
		viewRenderer: ViewRenderer
	): JSX.Element {
		return (
			<Column size={c.width as LayoutGridProps.ColumnSize} key={currentView}>
				{ApplicationModel.Dashboard.ContainerColumn.isInstance(c)
					? c.rows.map(r => renderRow(r, viewRenderer))
					: viewRenderer(currentView++)}
			</Column>
		);
	}
}

DashboardLayoutComponentNG.whyDidYouRender = true;
