// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useContext } from "react";

import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";
import { localizableFromLocalizationTreeMap } from "@com.mgmtp.a12.utils/utils-localization/lib/main/localization/LocalizableFactory.js";
import { LoggerFactory } from "@com.mgmtp.a12.utils/utils-logging/lib/factory.js";
import { addPrefix } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/utils.js";
import type { LayoutGridProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/layout-grid/main/layout-grid.api.js";

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
