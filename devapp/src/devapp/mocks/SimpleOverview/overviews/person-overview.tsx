// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";

import type { ViewNGProps } from "@com.mgmtp.a12.client/client-core";
import type { BaseColumnType } from "@com.mgmtp.a12.widgets/widgets-core/lib/table/new-api/column.api.js";

import type { Person } from "../../PersonMocks.js";

import { SimpleOverview } from "../view.js";

export function PersonOverview(props: ViewNGProps): JSX.Element {
	return <SimpleOverview {...props} title={"Person"} columns={PersonColumns} />;
}

const PersonColumns: BaseColumnType<Person>[] = [
	{
		label: "FirstName",
		dataGetter: ({ row }) => row.Person.PersonalData.FirstName
	},
	{
		label: "LastName",
		dataGetter: ({ row }) => row.Person.PersonalData.LastName
	},
	{
		label: "Place of birth",
		dataGetter: ({ row }) => row.Person.PersonalData.PlaceOfBirth
	},
	{
		label: "Nationality",
		dataGetter: ({ row }) => row.Person.PersonalData.Nationality
	}
];
