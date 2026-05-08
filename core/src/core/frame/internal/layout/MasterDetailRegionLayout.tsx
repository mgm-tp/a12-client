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

import type { ComponentType, JSX } from "react";
import { useContext, useEffect, useRef } from "react";

import type {
	Animation,
	MasterDetailProps,
	ViewWidth,
	VisibleView
} from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/master-detail/main/master-detail.api.js";
import { SizeContext } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/size-detector/main/size-context.js";
import type { SizeDetectorProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/size-detector/main/size-detector.api.js";

import { ClientWidgetMapContext } from "../../../ClientWidgetMap.js";
import { ApplicationModel } from "../../../model/index.js";
import type { View } from "../../../view/index.js";
import { isOnSmallDevice } from "../../../view/internal/size-context.js";

import { DefaultErrorBoundaryProvider } from "../components/error-boundary/DefaultErrorBoundaryProvider.js";

import type { Layout, LayoutProps } from "./LayoutProps.js";

const LEFT_TO_RIGHT_ANIMATION: Animation = { animateSingleItem: "ltr" };
const RIGHT_TO_LEFT_ANIMATION: Animation = { animateSingleItem: "rtl" };

/**
 * Props used to render the MasterDetailRegionLayout component
 */
export interface MasterDetailLayoutProps extends LayoutProps {
	/**
	 * @deprecated since Client 16.1.0. This property will be removed in the next major release.
	 * Use the {@link ClientWidgetMapContext} instead.
	 *
	 * A map of components that will be used instead of the corresponding
	 * default components, if they are provided.
	 */
	readonly widgetMap?: {
		/**
		 * Component used instead of the layouts default root component, if provided.
		 */
		readonly masterDetail: ComponentType<MasterDetailProps>;
	};
}

/**
 * RegionLayout based on A12 Master Detail Layout.
 */
function MasterDetailRegionLayout(props: MasterDetailLayoutProps): JSX.Element | null {
	const { MasterDetail } = useContext(ClientWidgetMapContext);
	const sizeContext = useContext(SizeContext);
	const {
		viewProvider,
		progressComponentProvider,
		errorBoundaryProvider = DefaultErrorBoundaryProvider,
		regionReference,
		views,
		// TODO: Remove with A12-17777
		// eslint-disable-next-line @typescript-eslint/no-deprecated
		widgetMap
	} = props;

	const previousViews = useRef<View[]>([]);
	useEffect(() => {
		previousViews.current = views;
	}, [views]);

	// initialize and run layout manager
	if (views.length === 0) {
		return <div data-testid="empty-div" />;
	}

	/*
	 * The animation direction shall only change if the view stack changes.
	 * In all other case the direction of the last stack change shall be used.
	 * This makes the animation more robust when having several render calls in close succession.
	 */
	const animation: Animation | undefined =
		!isOnSmallDevice(sizeContext.currentSize) || previousViews.current.length === 0
			? undefined
			: previousViews.current.length < views.length
				? RIGHT_TO_LEFT_ANIMATION
				: previousViews.current.length > views.length
					? LEFT_TO_RIGHT_ANIMATION
					: undefined;

	const onSmallDevice = isOnSmallDevice(sizeContext.currentSize);

	const visibleViewCount = onSmallDevice ? 1 : 2;

	const splitIndex = Math.max(0, views.length - visibleViewCount);

	const lastView = views[views.length - 1];
	const lastViewConstraints =
		lastView.constraints &&
		ApplicationModel.MasterDetail.ViewConstraint.isInstance(lastView.constraints)
			? lastView.constraints
			: undefined;
	const widthOfLastView = lastViewConstraints?.preferredWidth ?? 6;

	const visibleViews: VisibleView[] = views.slice(splitIndex).map((view, index, array) => {
		const { name, activityId, ...others } = view;
		const ViewComponent = viewProvider(name);

		const ProgressComponent = progressComponentProvider(regionReference, name);
		const ErrorBoundary = errorBoundaryProvider(regionReference, name);
		return {
			// If only one view is given, 12 is used, otherwise use the preferred width of the last view if given.
			// This assumes that only 1 or 2 view are visible at all time!
			width: (array.length === 1
				? 12
				: index === 0
					? 12 - widthOfLastView
					: widthOfLastView) as ViewWidth,
			element: (
				<ErrorBoundary activityId={activityId} key={name} ariaLevel={index + 1}>
					{ViewComponent.handleProgressIndicator ? (
						<ViewComponent
							name={name}
							activityId={activityId}
							ariaLevel={index + 1}
							{...others}
							ProgressComponent={ProgressComponent}
						/>
					) : (
						<ProgressComponent activityId={activityId}>
							<ViewComponent
								name={name}
								activityId={activityId}
								ariaLevel={index + 1}
								{...others}
							/>
						</ProgressComponent>
					)}
				</ErrorBoundary>
			),
			key: `${index + splitIndex}-${name}`
		};
	});

	const MasterDetailComponent = widgetMap?.masterDetail ?? MasterDetail;

	return (
		<MasterDetailComponent
			visibleViews={visibleViews}
			animation={onSmallDevice ? animation : undefined}
			// This prevents animation if the top level activity changes
			key={views[0].activityId}
		/>
	);
}

MasterDetailRegionLayout.whyDidYouRender = true;

const layout: Layout = {
	component: MasterDetailRegionLayout,
	visibleViews: "single",
	getClearedAfterViewIndex(layoutProps: LayoutProps) {
		return (size?: SizeDetectorProps.Size) => {
			if (isOnSmallDevice(size) && layoutProps.views.length > 1) {
				return layoutProps.views.length - 2;
			}

			return undefined;
		};
	}
};

/** @internal */
export default layout;
