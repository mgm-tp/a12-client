// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";

import type { View } from "@com.mgmtp.a12.client/client-core";
import { ActionContentbox } from "@com.mgmtp.a12.widgets/widgets-core/lib/contentbox/main/action-contentbox/action-contentbox.view.js";

import { SimpleSagaStatusTemplate } from "./simpleSagaStatusTemplate.js";
import { SimpleSagaTemplate } from "./simpleSagaTemplate.js";

export function SimpleSaga(props: View): JSX.Element {
	return (
		<SimpleSagaTemplate {...props} name="SimpleSaga" StatusComponent={SimpleSagaStatusTemplate} />
	);
}

export function SimpleSagaStatus(props: View): JSX.Element {
	return (
		<ActionContentbox>
			<SimpleSagaStatusTemplate {...props} />
		</ActionContentbox>
	);
}
