/*
 * SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
 *
 * Copyright (c) 2012-2026 mgm technology partners GmbH
 *
 * Dual License
 * ------------
 * This source file is part of the mgm A12 Platform and available under
 * a choice of two different licenses:
 *
 * 1. Open-Source License – EUPL v1.2
 *    You may redistribute and/or modify this file under the terms of the
 *    European Union Public License, version 1.2 - see https://eupl.eu/.
 *
 * 2. Commercial License
 *    Alternatively, you may obtain a commercial license from
 *    mgm technology partners GmbH, that permits use of this software
 *    under different terms (including support and maintenance services).
 *
 *    Please contact a12-license@mgm-tp.com for more information.
 *
 * You must select and comply with exactly one of the above license options.
 *
 * Warranty Disclaimer (applies to either option)
 * ----------------------------------------------
 * THIS SOFTWARE IS PROVIDED “AS IS” AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

import { deepStrictEqual, ok, strictEqual } from "node:assert/strict";
import { mock } from "node:test";

import { act, render } from "@testing-library/react";

import { Locale } from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";
import type { SelectProps } from "@com.mgmtp.a12.widgets/widgets-core/lib/input/select/main/select.api.js";

import { type ClientWidgetMap } from "../../../../../core/ClientWidgetMap.js";
import type { LocaleSelectProps } from "../../../../../core/frame/internal/components/LocaleSelect.js";
import {
	LOCALE_SELECT_RESOURCE_KEYS,
	LocaleSelect
} from "../../../../../core/frame/internal/components/LocaleSelect.js";
import { LocaleSelectors } from "../../../../../core/locale/index.js";
import {
	DE_LOCALE,
	KEY_OUTPUT_LOCALIZER_CONTEXT,
	US_LOCALE
} from "../../../../utils/localization.js";
import { TestWrapper } from "../../../../utils/rtl/testWrapper.js";
import { createApplicationSetup } from "../../../../utils/test-utils.js";

describe("core.frame.internal.components.LocaleSelect", () => {
	function setup(props: LocaleSelectProps) {
		const { store } = createApplicationSetup({ locale: US_LOCALE });

		const SelectMock = mock.fn((props: SelectProps) => <></>);

		const CustomWidgetMap = {
			Select: SelectMock
		} satisfies Partial<ClientWidgetMap>;

		render(
			<TestWrapper
				store={store}
				localizerContextValue={KEY_OUTPUT_LOCALIZER_CONTEXT}
				customWidgetMap={CustomWidgetMap}
			>
				<LocaleSelect {...props} />
			</TestWrapper>
		);

		return { SelectMock, store };
	}

	it("passes props to select widget", () => {
		const locales = [DE_LOCALE, US_LOCALE];

		const { SelectMock } = setup({ hideLabel: true, locales });

		const props = SelectMock.mock.calls.at(0)?.arguments.at(0);

		strictEqual(props?.hideLabel, true);
		strictEqual(props?.label, LOCALE_SELECT_RESOURCE_KEYS.LocaleSelect.label);

		locales.forEach((l, i) => {
			strictEqual(
				props?.items[i].label,
				`${LOCALE_SELECT_RESOURCE_KEYS.LocaleSelect.locale}.${Locale.toString(l)}`
			);
		});
	});

	it("triggers set locale action when changing the select value", async () => {
		const { SelectMock, store } = setup({ locales: [DE_LOCALE, US_LOCALE] });

		const props = SelectMock.mock.calls.at(0)?.arguments.at(0);

		const callback = props?.onValueChanged;
		ok(callback, "onValueChanged must not be undefined");

		await act(() => callback(Locale.toString(DE_LOCALE)));

		deepStrictEqual(LocaleSelectors.locale()(store.getState()), DE_LOCALE);
	});

	it("triggers set locale action when selecting the current select value", async () => {
		const { SelectMock, store } = setup({ locales: [DE_LOCALE, US_LOCALE] });

		const props = SelectMock.mock.calls.at(0)?.arguments.at(0);

		const callback = props?.onValueChanged;
		ok(callback, "onValueChanged must not be undefined");

		await act(() => callback(Locale.toString(US_LOCALE)));

		deepStrictEqual(LocaleSelectors.locale()(store.getState()), US_LOCALE);
	});
});
