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

import type { ComponentType } from "react";

import { ApplicationModel } from "../../model/index.js";
import type { View } from "../../view/index.js";

import { DefaultProgressComponentProvider } from "./components/DefaultProgressComponentProvider.js";
import { DefaultErrorBoundaryProvider } from "./components/error-boundary/DefaultErrorBoundaryProvider.js";
import { GenericCaseMenu } from "./layout/ApplicationFrameLayout/generic-component.js";
import { DefaultRegionUi } from "./layout/DefaultRegionUi.js";
import DefaultLayoutProvider from "./layout/index.js";
import type { Layout, RegionUiProps } from "./layout/LayoutProps.js";
import { ModalRegionUi } from "./layout/ModalRegionUi.js";

/**
 * Configuration of factories for frame components
 */
export namespace FrameFactories {
	/**
	 * Provider of React component for region UI
	 *
	 * @param regionRef regionRef
	 */
	export function regionUiProvider(
		regionRef: ApplicationModel.Region.Reference
	): ComponentType<RegionUiProps> {
		return ApplicationModel.Region.Reference.equal(["MODAL"], regionRef)
			? ModalRegionUi
			: DefaultRegionUi;
	}

	/**
	 * Provider of React component for layout
	 */
	export const layoutProvider: (name: string) => Layout = DefaultLayoutProvider;

	const Views: Record<string, ComponentType<View>> = {
		GenericCaseMenu
	};

	/**
	 * Provider of React component for view
	 *
	 * @param componentName componentName
	 */
	export function viewProvider(componentName: string): ComponentType<View> {
		return Views[componentName];
	}

	/**
	 * Creates a provider of a ProgressIndicator widget showing a loading
	 * spinner if the busy flag of the related activity is true.
	 */
	export function createProgressComponentProvider(): View.ProgressComponentProvider {
		return DefaultProgressComponentProvider;
	}

	/**
	 * Provider of an ErrorBoundary.
	 */
	export function errorBoundaryProvider(): ComponentType<View.ErrorBoundaryProvider.PropsType> {
		return DefaultErrorBoundaryProvider();
	}
}
