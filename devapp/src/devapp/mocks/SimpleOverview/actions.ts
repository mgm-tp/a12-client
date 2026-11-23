// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { actionCreatorFactory } from "typescript-fsa";

import type { ActivityActions } from "@com.mgmtp.a12.client/client-core";

export namespace SimpleOverviewActions {
	const factory = actionCreatorFactory("SimpleOverview");

	export const onQueryParametersChanged = factory<QueryParametersChangedPayload>(
		"onQueryParametersChanged"
	);
	export interface QueryParametersChangedPayload extends ActivityActions.ActivityActionPayload {
		fullTextSearch?: string;
	}

	export const onSelectDocument = factory<SelectDocumentPayload>("onSelectDocument");
	export interface SelectDocumentPayload extends ActivityActions.ActivityActionPayload {
		readonly documentId: string;
		readonly model?: string;
	}

	export const onCreateDocument = factory<CreateDocumentPayload>("onCreateDocument");
	export interface CreateDocumentPayload extends ActivityActions.ActivityActionPayload {
		readonly model?: string;
	}
}
