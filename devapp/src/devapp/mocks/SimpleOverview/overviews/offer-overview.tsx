// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";

import type { View } from "@com.mgmtp.a12.client/client-core";
import type { BaseColumnType } from "@com.mgmtp.a12.widgets/widgets-core/lib/table/new-api/column.api.js";

import { SimpleOverview } from "../view.js";

export function OfferOverview(props: View): JSX.Element {
	return <SimpleOverview {...props} title={"Offer"} columns={PersonColumns} />;
}

interface Offer {
	Offer: {
		Id: string;
		Title: string;
	};
}

const PersonColumns: BaseColumnType<Offer>[] = [
	{
		label: "Id",
		dataGetter: ({ row }) => row.Offer.Id
	},
	{
		label: "Title",
		dataGetter: ({ row }) => row.Offer.Title
	}
];
