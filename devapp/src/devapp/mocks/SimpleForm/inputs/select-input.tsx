// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { JSX } from "react";
import { useMemo } from "react";

import type {
	SelectItem,
	SelectProps
} from "@com.mgmtp.a12.widgets/widgets-core/lib/input/select/main/select.api.js";
import { Select } from "@com.mgmtp.a12.widgets/widgets-core/lib/input/select/main/select.view.js";

import { useSingleDocumentValue } from "../hooks.js";

import type { BaseInput } from "./base-input.js";

interface Props extends Omit<SelectProps, "items">, BaseInput.Props {
	readonly items: SelectItem[] | string[];
}

export function SelectInput(props: Props): JSX.Element {
	const [value, setValue] = useSingleDocumentValue<string>(props.path);

	const items = useMemo(() => {
		return props.items.map(item => {
			if (typeof item === "string") {
				return { value: item, label: item.replace(/\W+/g, " ") };
			}
			return item;
		});
	}, [props.items]);

	return <Select {...props} value={value} items={items} onValueChanged={setValue} />;
}
