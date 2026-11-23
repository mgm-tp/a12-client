// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

// tag::widgetMap[]
import type { JSX } from "react";
import { useContext } from "react";

import { ClientWidgetMapContext, FrameViews } from "@com.mgmtp.a12.client/client-core";
import type { MasterDetailProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/master-detail/main/master-detail.api.js";
import { MasterDetail } from "@com.mgmtp.a12.widgets/widgets-core/lib/layout/master-detail/main/master-detail.view.js";

function CustomMasterDetail(props: MasterDetailProps): JSX.Element {
	return <MasterDetail {...props} /* customization here*/ />;
}

export function CustomResizableMasterDetailLayout(
	props: FrameViews.MasterDetailLayoutProps
): JSX.Element {
	const DefaultClientWidgetMap = useContext(ClientWidgetMapContext);

	const customWidgetMap = {
		...DefaultClientWidgetMap,
		MasterDetail: CustomMasterDetail
	};
	return (
		<ClientWidgetMapContext.Provider value={customWidgetMap}>
			<FrameViews.MasterDetailRegionLayout {...props} />
		</ClientWidgetMapContext.Provider>
	);
}
// end::widgetMap[]
