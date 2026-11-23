// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
