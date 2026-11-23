// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { identity } from "fp-ts/lib/function.js";
import {
	Fragment,
	useCallback,
	useMemo,
	type ComponentType,
	type PropsWithChildren,
	type ReactElement
} from "react";
import type { Store } from "redux";

import { DynamicRegionUi } from "../../../frame/index.js";
import { FrameFactories } from "../../../frame/internal/factories.js";
import type { ApplicationModel } from "../../../model/internal/ApplicationModel.js";
import type { View } from "../../../view/internal/view.js";

import type { A12ApplicationConfig } from "./applicationConfig.js";
import { ModuleRegistryProvider } from "./moduleRegistryProvider.js";

export const isDevelopment = process.env.NODE_ENV === "development";

const DEFAULT_ROOT_REGION_REF: ApplicationModel.Region.Reference = [];

export function createRootRegion(appConfig: A12ApplicationConfig, store: Store) {
	const rootRegionRef = appConfig.config.rootRegionRef ?? DEFAULT_ROOT_REGION_REF;
	const Wrapper = appConfig.config.WrapperComponent ?? Fragment;

	return (
		<Wrapper>
			{appConfig.config.dynamicConfig ? (
				<DynamicRegionUi regionRef={rootRegionRef.join("/")} />
			) : (
				<AppModelRootRegion />
			)}
		</Wrapper>
	);

	function AppModelRootRegion() {
		const viewProvider = useCallback((name: string) => {
			const fallback = (name: string) => {
				return appConfig.config.views?.(name) ?? FrameFactories.viewProvider(name) ?? Placeholder;
			};
			const View = ModuleRegistryProvider.getViewProvider(store.getState(), fallback)(name);
			const modifyView = appConfig.config.viewModifications?.(name) ?? identity;
			return modifyView(View);
		}, []);

		const layoutProvider = useCallback((name: string) => {
			const Layout = appConfig.config.layouts?.(name) ?? FrameFactories.layoutProvider(name);
			const modifyLayout = appConfig.config.layoutModifications?.(name) ?? identity;
			return modifyLayout(Layout);
		}, []);

		const regionProvider = useCallback((regionRef: ApplicationModel.Region.Reference) => {
			return appConfig.config.regions?.(regionRef) ?? FrameFactories.regionUiProvider(regionRef);
		}, []);

		const progressComponentProvider = useCallback(
			(regionReference: ApplicationModel.Region.Reference, viewName: string) => {
				return (
					appConfig.config.progressIndicators?.(regionReference, viewName) ??
					FrameFactories.createProgressComponentProvider()(regionReference, viewName)
				);
			},
			[]
		);

		const errorBoundaryProvider = useCallback(
			(regionReference: ApplicationModel.Region.Reference, viewName: string) => {
				return (
					appConfig.config.errorBoundaries?.(regionReference, viewName) ??
					FrameFactories.errorBoundaryProvider()
				);
			},
			[]
		);

		const RegionUi = useMemo(() => FrameFactories.regionUiProvider(rootRegionRef), []);

		return (
			<RegionUi
				key="region"
				regionReference={rootRegionRef}
				layoutProvider={layoutProvider}
				regionUiProvider={regionProvider}
				viewProvider={viewProvider}
				progressComponentProvider={progressComponentProvider}
				errorBoundaryProvider={errorBoundaryProvider}
			/>
		);
	}
}

/**
 * Fallback in the case that no view provider has been defined to handle a specific view.
 */
function Placeholder(props: View): ReactElement {
	if (!isDevelopment) {
		throw new Error(`No view renderer found: '${props.name}'`);
	}
	return <div>No view renderer found: `{props.name}`</div>;
}

export function combineWrappers(
	AdditionalWrapper: ComponentType<PropsWithChildren>,
	Wrapper: ComponentType<PropsWithChildren>
): ComponentType<PropsWithChildren> {
	return function WithAdditionalWrapper(p: PropsWithChildren) {
		return (
			<Wrapper>
				<AdditionalWrapper {...p} />
			</Wrapper>
		);
	};
}
