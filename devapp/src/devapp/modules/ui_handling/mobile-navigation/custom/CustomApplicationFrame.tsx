// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type {
	ApplicationFrameLayoutPropsNG,
	LayoutNG,
	ViewNG
} from "@com.mgmtp.a12.client/client-core";

import { DevappApplicationFrameLayout } from "../../../../NewLayoutsModule.js";

const getClearedAfterViewIndex = (_: LayoutNG, views: ViewNG[]) => {
	return () => (views.length > 2 ? views.length - 2 : undefined);
};

export function CustomApplicationFrame(props: ApplicationFrameLayoutPropsNG) {
	return (
		<DevappApplicationFrameLayout
			{...props}
			multipleViewsContent
			getClearedAfterViewIndex={getClearedAfterViewIndex}
		/>
	);
}
