// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";

import type { EngineFrameProps } from "../utils.js";
import { EngineFrame, useDefaultDataHolder } from "../utils.js";

import { SimpleFormActions } from "./index.js";

export function SimpleForm(props: Omit<EngineFrameProps, "type">): JSX.Element {
	const activityId = props.activityId;
	const dispatch = useDispatch();
	const onSave = useCallback(
		() => dispatch(SimpleFormActions.onSave({ activityId })),
		[activityId, dispatch]
	);
	const onCancel = useCallback(
		() => dispatch(SimpleFormActions.onCancel({ activityId })),
		[activityId, dispatch]
	);

	const defaultDataHolder = useDefaultDataHolder();
	const dirty = useMemo(() => defaultDataHolder.dirty, [defaultDataHolder.dirty]);

	return (
		<EngineFrame
			{...props}
			type={"Form"}
			padding
			footer={
				props.footer ?? {
					leftButtons: [{ label: "Cancel", destructive: true, onClick: onCancel }],
					rightButtons: [{ label: "Commit", disabled: !dirty, primary: true, onClick: onSave }]
				}
			}
		>
			{props.children}
		</EngineFrame>
	);
}
