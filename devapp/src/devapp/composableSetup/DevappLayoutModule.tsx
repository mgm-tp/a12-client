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

import type { JSX } from "react";
import { useContext } from "react";

import type { DynamicConfiguration, LayoutPropsNG } from "@com.mgmtp.a12.client/client-core";
import {
	ClientWidgetMapContext,
	MasterDetailRegionLayoutNG,
	NullRegionLayoutNG,
	StackRegionLayoutNG
} from "@com.mgmtp.a12.client/client-core";
import { MasterDetail, type MasterDetailProps } from "@com.mgmtp.a12.widgets/widgets-core";

import { DevappApplicationFrameLayout } from "./DevappApplicationFrameLayout.js";

const mdFirstViewResizableOptions: MasterDetailProps["firstViewResizableOptions"] = {
	minWidth: "5%",
	maxWidth: "95%"
};

function ResizableMasterDetail(props: MasterDetailProps): JSX.Element {
	return <MasterDetail {...props} firstViewResizableOptions={mdFirstViewResizableOptions} />;
}

function DevappMasterDetailRegionLayout(props: LayoutPropsNG): JSX.Element {
	const DefaultClientWidgetMap = useContext(ClientWidgetMapContext);

	const customMasterDetailLayoutWidgetMap = {
		...DefaultClientWidgetMap,
		MasterDetail: ResizableMasterDetail
	};

	return (
		<ClientWidgetMapContext.Provider value={customMasterDetailLayoutWidgetMap}>
			<MasterDetailRegionLayoutNG.component {...props} />
		</ClientWidgetMapContext.Provider>
	);
}

// Without this the appmodel adapter falls back to the layouts that do not know
// about dynamic configuration.
export const DevappLayoutModule: DynamicConfiguration = {
	id: "setup.devapp-layout",
	regions: [
		{
			name: "", // the root region has no name!
			layout: { component: DevappApplicationFrameLayout },
			subRegions: [
				{
					name: "CONTENT",
					layout: { component: DevappMasterDetailRegionLayout }
				},
				{
					name: "SIDEBAR",
					layout: NullRegionLayoutNG
				},
				{
					name: "MODAL",
					layout: StackRegionLayoutNG
				}
			]
		}
	]
};
