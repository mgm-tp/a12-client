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
