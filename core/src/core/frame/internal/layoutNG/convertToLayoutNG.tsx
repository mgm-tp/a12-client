// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { useContext } from "react";
import { useSelector } from "react-redux";

import { memoize } from "../../../3rd-party-licenses/memoize.js";
import type { ApplicationModel } from "../../../model/internal/ApplicationModel.js";
import { ViewSelectors } from "../../../view/internal/selectors.js";

import { LayoutProvidersContext } from "../layout/LayoutProvidersContext.js";

import type { LayoutNG, LayoutPropsNG } from "./layoutPropsNG.js";

/**
 * @internal
 */
export const convertToLayoutNG = memoize(
	(layout: ApplicationModel.Layout, path: ApplicationModel.Region.Reference): LayoutNG => {
		// oxlint-disable-next-line no-unused-vars
		function WrapperLayout(props: LayoutPropsNG) {
			const providerProps = useContext(LayoutProvidersContext);
			const { component: OldLayout } = providerProps.layoutProvider(layout.name);

			const { views } = useSelector(ViewSelectors.region(path));

			return (
				<OldLayout
					{...providerProps}
					regionReference={path}
					views={views}
					settings={layout.settings}
				/>
			);
		}

		return { component: WrapperLayout };
	},
	cacheKeyResolver
);

function cacheKeyResolver(
	layout: ApplicationModel.Layout,
	path: ApplicationModel.Region.Reference
): string {
	return `${layout.name}.${JSON.stringify(layout.settings)}.${path.join(".")}`;
}
