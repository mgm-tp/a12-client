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

import { act, type ComponentType, type JSX } from "react";
import { Provider } from "react-redux";
import type { Store } from "redux";
import { StyleSheetManager, ThemeProvider } from "styled-components";

import { render } from "@com.mgmtp.a12.devtools/react";
import { LocalizerContext } from "@com.mgmtp.a12.utils/utils-localization-react/lib/main/index.js";
import { shouldForwardProp } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/should-forward-prop.js";
import { defaultTheme } from "@com.mgmtp.a12.widgets/widgets-core/lib/theme/default/default-theme.js";

import { FrameFactories } from "../../../../../core/frame/internal/factories.js";
import type { LayoutProps } from "../../../../../core/frame/internal/layout/LayoutProps.js";
import type { FrameViews } from "../../../../../core/frame/internal/views.js";
import type { View } from "../../../../../core/view/index.js";
import { createActivity } from "../../../../utils/activity.js";
import { KEY_OUTPUT_LOCALIZER_CONTEXT } from "../../../../utils/localization.js";

const MockView: View.ViewComponent = props => {
	return <div data-testid={props.name}>{props.name}</div>;
};
MockView.handleProgressIndicator = true;
export const defaultProps: LayoutProps = {
	regionReference: [],
	layoutProvider: FrameFactories.layoutProvider,
	regionUiProvider: FrameFactories.regionUiProvider,
	views: [],
	viewProvider: () => MockView,
	errorBoundaryProvider: CustomErrorBoundaryProvider,
	progressComponentProvider: () => () => <div /> // unused
};

export function CustomErrorBoundaryProvider(): ComponentType<View.ErrorBoundaryProvider.PropsType> {
	return CustomBoundary;
}

export function CustomBoundary(props: View.ErrorBoundaryProvider.PropsType): JSX.Element {
	return <div data-testid="ErrorBoundary">{props.children}</div>;
}

export function renderLayout<P extends FrameViews.LayoutProps>(
	store: Store<object>,
	props: P,
	Component: ComponentType<P>,
	activity: { id: string },
	settings?: object
) {
	const views: View[] = [
		{ name: "ViewA", activityId: activity.id },
		{ name: "ViewB", activityId: activity.id }
	];

	return act(() =>
		render(
			<StyleSheetManager shouldForwardProp={shouldForwardProp}>
				<ThemeProvider theme={defaultTheme}>
					<Provider store={store}>
						<LocalizerContext.Provider value={KEY_OUTPUT_LOCALIZER_CONTEXT}>
							<Component {...props} views={views} settings={settings} />
						</LocalizerContext.Provider>
					</Provider>
				</ThemeProvider>
			</StyleSheetManager>
		)
	);
}

export const activity = createActivity({
	id: "A",
	descriptor: { page: "ModalRegion" }
});
