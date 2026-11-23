// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

// tag::content[]
import type { JSX } from "react";
import { useContext } from "react";

import { NavigationContentboxContext } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";
import { ContentBoxElements } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/template/contentbox.tpl.view.js";

export function BackButton(): JSX.Element | null {
	const { onBackButtonClicked } = useContext(NavigationContentboxContext);
	return onBackButtonClicked ? (
		<ContentBoxElements.BackButton onClick={onBackButtonClicked} />
	) : null;
}
// end::content[]
