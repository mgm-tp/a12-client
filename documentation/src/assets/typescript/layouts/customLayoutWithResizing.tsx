// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

// tag::content[]

import { useContext, type JSX } from "react";

import {
	ClientWidgetMapContext,
	FrameFactories,
	FrameViews
} from "@com.mgmtp.a12.client/client-core";
import type {
	MasterDetailProps,
	VisibleView
} from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/master-detail/main/master-detail.api.js";
import { MasterDetail } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/master-detail/main/master-detail.view.js";

export const customLayoutProvider: FrameViews.LayoutProvider = name => {
	return name === "MyResizableMasterDetailLayout"
		? { component: CustomResizableMasterDetailLayout }
		: FrameFactories.layoutProvider(name);
};

const resizeOptions: VisibleView["resizableOptions"] = {
	minWidth: 200,
	maxWidth: "75%"
};

function ResizableMasterDetail(props: MasterDetailProps): JSX.Element {
	return <MasterDetail {...props} firstViewResizableOptions={resizeOptions} />;
}

export function CustomResizableMasterDetailLayout(
	props: FrameViews.MasterDetailLayoutProps
): JSX.Element {
	const DefaultClientWidgetMap = useContext(ClientWidgetMapContext);

	const customWidgetMap = {
		...DefaultClientWidgetMap,
		MasterDetail: ResizableMasterDetail
	};

	return (
		<ClientWidgetMapContext.Provider value={customWidgetMap}>
			<FrameViews.MasterDetailRegionLayout {...props} />
		</ClientWidgetMapContext.Provider>
	);
}

// end::content[]
