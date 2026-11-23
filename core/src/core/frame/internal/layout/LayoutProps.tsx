// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ComponentType } from "react";

import type { SizeDetectorProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/size-detector/main/size-detector.api.js";

import type { ApplicationModel } from "../../../model/internal/ApplicationModel.js";
import type { View } from "../../../view/internal/view.js";

export interface ProvidersProps {
	/** Layout to be used by the component */
	readonly layoutProvider: LayoutProvider;

	/** Region in which the component resides */
	readonly regionUiProvider: RegionUiProvider;

	/** Use to lookup React components of sub-components (by name) */
	readonly viewProvider: View.Provider;

	/** Use to lookup React components for progress indications of a view */
	readonly progressComponentProvider: View.ProgressComponentProvider;

	/** Use to lookup React components for error boundaries of a view */
	readonly errorBoundaryProvider?: View.ErrorBoundaryProvider;
}

export interface RegionUiProps extends ProvidersProps {
	/** Reference to the region (in the app model) */
	readonly regionReference: ApplicationModel.Region.Reference;
}

export interface LayoutProps extends ProvidersProps {
	/**
	 * Region reference from the delegation region.
	 */
	readonly regionReference: ApplicationModel.Region.Reference;

	/**
	 * Layout specific settings.
	 *
	 * @example The dashboard will contain information about the row and
	 * column configuration.
	 */
	readonly settings?: object;

	/**
	 * View composition that will embedded into the layout.
	 */
	readonly views: View[];
}

export type RegionUiProvider = (
	region: ApplicationModel.Region.Reference
) => ComponentType<RegionUiProps>;

export type LayoutProvider = (layout: string) => Layout;

/**
 * Layout specifications
 */
export interface Layout {
	/** The React component for the layout */
	readonly component: ComponentType<LayoutProps>;
	/**
	 * Whether the layout shows one or multiple views
	 * in mobile mode.
	 */
	readonly visibleViews?: "single" | "multiple";

	/**
	 * An optional function which needs to return the index of
	 * the view after which the layout clears the region.
	 * For example if there are 4 views [v1, v2, v3, v4] and the
	 * layout only shows the last two views, "getClearedAfterViewIndex"
	 * needs to return "1"
	 */
	getClearedAfterViewIndex?(
		layoutProps: LayoutProps
	): (size?: SizeDetectorProps.Size) => number | undefined;
}
