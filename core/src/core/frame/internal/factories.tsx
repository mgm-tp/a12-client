// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
