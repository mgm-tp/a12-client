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

import type { ComponentType, Context, CSSProperties } from "react";

import type {
	Container,
	ProgressIndicatorProps as WidgetProgressIndicatorProps
} from "@com.mgmtp.a12.widgets/widgets-core";

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
