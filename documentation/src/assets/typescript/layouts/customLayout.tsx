// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

// tag::content[]
import type { JSX } from "react";

import { FrameFactories, FrameViews } from "@com.mgmtp.a12.client/client-core";

export const customLayoutProvider: FrameViews.LayoutProvider = name => {
	return name === "ApplicationFrame"
		? { component: CustomAppFrameLayout }
		: FrameFactories.layoutProvider(name);
};

function CustomAppFrameLayout(props: FrameViews.ApplicationFrameLayoutProps): JSX.Element {
	return <FrameViews.ApplicationFrameLayout {...props} logoURL="/images/my_logo.svg" />;
}
// end::content[]
