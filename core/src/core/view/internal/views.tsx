// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ComponentType, Context, CSSProperties } from "react";

import type { Container } from "@com.mgmtp.a12.widgets/widgets-core/lib/common/main/base-props.js";
import type { ProgressIndicatorProps as WidgetProgressIndicatorProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/progress-indicator/main/progress-indicator.api.js";

import type { ActivityContextProps as InternalActivityContextProps } from "./components/ActivityContext.js";
import { ActivityContext as InternalActivityContext } from "./components/ActivityContext.js";
import BaseProgressIndicator from "./components/progress-indicator.js";
import type { View } from "./view.js";

export namespace ViewViews {
	export interface ViewProps {
		readonly view: View;
		readonly subExpanded: boolean;
	}

	/** Props for the ProgressIndicator */
	export interface ProgressIndicatorProps extends Container {
		/**
		 * Text which should be presented under the loading circle.
		 */
		readonly labelKey?: string;

		/** Progress state. The Indicator is not rendered in state 'none' */
		readonly progress: "none" | "loading" | "error";

		/** Optional style parameters */
		readonly style?: CSSProperties;

		/**
		 * Property to disable the fastAppear property of the widget.
		 */
		readonly disableFastAppear?: boolean;

		/**
		 * Delay time when opening the ProgressIndicator.
		 */
		readonly delay?: number;

		/**
		 * Indicates if the progress indicator is used in full screen for the whole application.
		 * Details can be found in the Widgets documentation of the ProgressIndicator.
		 *
		 * Default: false
		 */
		readonly global?: boolean;

		/**
		 * A custom progress indicator component.
		 * If given this component will be rendered instead of the default one.
		 *
		 * @deprecated since Client 16.1.0. Customize the ProgressIndicator widget via the
		 * `ClientWidgetMapContext` instead.
		 */
		readonly ProgressIndicatorComponent?: ComponentType<WidgetProgressIndicatorProps>;
	}

	/**
	 * This is a ui component for the A12 ProgressIndicator Widget.
	 */
	export const ProgressIndicator: ComponentType<ProgressIndicatorProps> = BaseProgressIndicator;

	export type ActivityContextProps = InternalActivityContextProps;

	/**
	 * Can be used to propagate the activity id of a view down the component tree.
	 */
	export const ActivityContext: Context<ActivityContextProps | undefined> = InternalActivityContext;
}
