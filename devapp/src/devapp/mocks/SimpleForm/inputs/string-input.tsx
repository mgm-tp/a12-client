// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX, ReactNode } from "react";

import type { BaseInputProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/input/base/template/base.tpl.api.js";
import {
	BufferedInput,
	HTMLInputAdapter
} from "@com.mgmtp.a12.widgets/widgets-core/lib/input/buffered/main/buffered.view.js";
import { TextAreaStateless } from "@com.mgmtp.a12.widgets/widgets-core/lib/input/text-area/main/template/text-area.tpl.view.js";
import { TextField } from "@com.mgmtp.a12.widgets/widgets-core/lib/input/text-field/text-field.view.js";

import { useSingleDocumentValue } from "../hooks.js";

import type { BaseInput } from "./base-input.js";

interface Props extends BaseInputProps, BaseInput.Props {
	readonly textArea?: boolean;
	readonly addonAfter?: ReactNode | ReactNode[];
}

const ControlledTextField = BufferedInput(HTMLInputAdapter(TextField));
const ControlledTextArea = BufferedInput(HTMLInputAdapter(TextAreaStateless));

export function StringInput(props: Props): JSX.Element {
	const { textArea, ...rest } = props;
	const [value, setValue] = useSingleDocumentValue<string>(props.path);

	return textArea ? (
		<ControlledTextArea {...rest} initialValue={value} onValueSubmit={setValue} />
	) : (
		<ControlledTextField {...rest} initialValue={value} onValueSubmit={setValue} />
	);
}
