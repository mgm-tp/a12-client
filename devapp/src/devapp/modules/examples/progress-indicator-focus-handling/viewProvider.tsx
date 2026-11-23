// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { View } from "@com.mgmtp.a12.client/client-core";

import { DescriptionView } from "./description.js";
import { ViewWithApplicationProgressIndicator } from "./viewWithApplicationProgressIndicator.js";
import { ViewWithOwnProgressIndicator } from "./viewWithOwnProgressIndicator.js";

export function viewProvider(componentName: string): View.ViewComponent | undefined {
	return Views[componentName];
}

const Views: { [name: string]: View.ViewComponent } = {
	DescriptionView,
	ViewWithApplicationProgressIndicator,
	ViewWithOwnProgressIndicator
};
