// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { useMemo } from "react";
import { useDispatch } from "react-redux";

import { useActivityId, useDefaultDataHolder } from "../utils.js";

import type { SingleDocumentData } from "./data.js";
import { getByPath } from "./pathUtils.js";

import { SimpleFormActions } from "./index.js";

export function useSingleDocumentValue<Value>(path: string): [Value, (newValue: Value) => void] {
	const dispatch = useDispatch();
	const data = useDefaultDataHolder().data as SingleDocumentData;
	const activityId = useActivityId();

	return useMemo(() => {
		return [
			getByPath(data.document, path.split(".")) as Value,
			newValue => dispatch(SimpleFormActions.onValueChanged({ activityId, path, value: newValue }))
		];
	}, [activityId, data, dispatch, path]);
}
