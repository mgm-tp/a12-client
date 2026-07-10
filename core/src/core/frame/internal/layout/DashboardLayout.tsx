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

import { localizableFromLocalizationTreeMap } from "@com.mgmtp.a12.utils/utils-localization";
import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react";
import { LoggerFactory } from "@com.mgmtp.a12.utils/utils-logging";
import { addPrefix, type LayoutGridProps } from "@com.mgmtp.a12.widgets/widgets-core";

import { ClientWidgetMapContext } from "../../../ClientWidgetMap.js";
import { LOCALE_RESOURCE_KEYS } from "../../../locale/index.js";
import { ApplicationModel } from "../../../model/index.js";

import { DefaultErrorBoundaryProvider } from "../components/error-boundary/DefaultErrorBoundaryProvider.js";
import { DEFAULT_TRANSLATIONS } from "../languages/index.js";

import type { Layout, LayoutProps } from "./LayoutProps.js";

const logger = LoggerFactory.getLogger("core/frame");

function isDashboardSettings(settings: object): settings is ApplicationModel.Dashboard.Settings {
	const { rows } = settings as ApplicationModel.Dashboard.Settings;

	return rows instanceof Array;
}

/**
 * @internal
 */
function DashboardLayout(props: LayoutProps): JSX.Element | null {
	const localizer = useContext(LocalizerContext).localizer;
	const {
		Grid: SizeContainer,
		Row: SizeContainerRow,
		Column: SizeContainerColumn
	} = useContext(ClientWidgetMapContext);
	const views = props.views;
	if (views.length === 0) {
		return null;
	}

	if (props.settings === undefined) {
		logger.error("Settings missing for DashboardLayout!");
		return null;
	}

	if (!isDashboardSettings(props.settings)) {
		logger.error("Invalid settings for DashboardLayout!", props.settings);
		return null;
	}

	const viewsComponents = views.map(view => ({
		view: view,
		ViewComponent: props.viewProvider(view.name)
	}));
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
			<SizeContainer fitToParent>
				{props.settings.rows.map(r => renderRow(r, render))}
			</SizeContainer>
		</>
	);

	function render(viewIndex: number): JSX.Element | null {
		const ViewComponentHolder = viewsComponents[viewIndex];
		if (ViewComponentHolder === undefined) {
			return null;
		}
		const {
			progressComponentProvider,
			regionReference,
			errorBoundaryProvider = DefaultErrorBoundaryProvider
		} = props;

		const { view, ViewComponent } = ViewComponentHolder;

		const ProgressComponent = progressComponentProvider(regionReference, view.name);
		const ErrorBoundary = errorBoundaryProvider(regionReference, view.name);
		return (
			<div className={addPrefix("-u-height-full")}>
				<ErrorBoundary
					activityId={view.activityId}
					key={`View-${viewIndex}-${view.name}`}
					ariaLevel={2}
				>
					{ViewComponent.handleProgressIndicator ? (
						<ViewComponent {...view} ariaLevel={2} ProgressComponent={ProgressComponent} />
					) : (
						<ProgressComponent activityId={view.activityId}>
							<ViewComponent {...view} ariaLevel={2} />
						</ProgressComponent>
					)}
				</ErrorBoundary>
			</div>
		);
	}

	function renderRow(row: ApplicationModel.Dashboard.Row, viewRenderer: ViewRenderer): JSX.Element {
		return (
			<SizeContainerRow key={currentView}>
				{row.columns.map(c => renderColumn(c, viewRenderer))}
			</SizeContainerRow>
		);
	}

	function renderColumn(
		c: ApplicationModel.Dashboard.ContainerColumn | ApplicationModel.Dashboard.Slot,
		viewRenderer: ViewRenderer
	): JSX.Element {
		return (
			<SizeContainerColumn size={c.width as LayoutGridProps.ColumnSize} key={currentView}>
				{ApplicationModel.Dashboard.ContainerColumn.isInstance(c)
					? c.rows.map(r => renderRow(r, viewRenderer))
					: viewRenderer(currentView++)}
			</SizeContainerColumn>
		);
	}
}

DashboardLayout.whyDidYouRender = true;

const layout: Layout = {
	component: DashboardLayout,
	visibleViews: "multiple"
};

interface ViewRenderer {
	(view: number): JSX.Element | null;
}

/** @internal */
export default layout;
