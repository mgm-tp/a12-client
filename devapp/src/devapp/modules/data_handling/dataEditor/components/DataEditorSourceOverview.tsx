// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";

import type { View } from "@com.mgmtp.a12.client/client-core";
import type { BaseColumnType } from "@com.mgmtp.a12.widgets/widgets-core/lib/table/new-api/column.api.js";

import { SimpleOverview } from "../../../../mocks/SimpleOverview/view.js";

import type { AuthorDocument } from "../data/Author.js";

export function DataEditorSourceOverview(props: View): JSX.Element {
	return <SimpleOverview {...props} title="Authors" columns={AuthorColumns} />;
}

const AuthorColumns: BaseColumnType<AuthorDocument>[] = [
	{
		label: "Surname",
		dataGetter: ({ row }) => row.Author.surname
	},
	{
		label: "Name",
		dataGetter: ({ row }) => row.Author.name
	}
];
