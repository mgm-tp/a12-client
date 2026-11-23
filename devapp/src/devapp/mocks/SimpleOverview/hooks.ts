// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { useMemo } from "react";

import { useDefaultDataHolder } from "../utils.js";

import { DocumentListData } from "./data.js";

export function useDocumentListData(): DocumentListData {
	const defaultDataHolder = useDefaultDataHolder();

	return useMemo(() => {
		const data = defaultDataHolder.data;

		if (!DocumentListData.isInstance(data)) {
			throw new Error(`Data is not of type DocumentListData`);
		}

		return data;
	}, [defaultDataHolder.data]);
}
