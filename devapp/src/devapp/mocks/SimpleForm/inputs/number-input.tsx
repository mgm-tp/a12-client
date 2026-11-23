// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useCallback } from "react";

import {
	BufferedInput,
	HTMLInputAdapter
} from "@com.mgmtp.a12.widgets/widgets-core/lib/input/buffered/main/buffered.view.js";
import { TextField } from "@com.mgmtp.a12.widgets/widgets-core/lib/input/text-field/text-field.view.js";
import type { TextLineStatelessProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/input/text-line/main/template/text-line.tpl.api.js";

import { useSingleDocumentValue } from "../hooks.js";

import type { BaseInput } from "./base-input.js";

interface Props extends TextLineStatelessProps, BaseInput.Props {}

const ControlledTextField = BufferedInput(HTMLInputAdapter(TextField));

export function NumberInput(props: Props): JSX.Element {
	const [value, setValue] = useSingleDocumentValue<number | null>(props.path);
	const onValueSubmit = useCallback(
		(value: string | undefined) => setValue(value === undefined ? null : parseInt(value)),
		[setValue]
	);

	return (
		<ControlledTextField
			{...props}
			initialValue={value === null || value === undefined ? "" : String(value)}
			textAlignment="right"
			submitOnEnter
			onValueSubmit={onValueSubmit}
		/>
	);
}
