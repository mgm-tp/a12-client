// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepStrictEqual, strictEqual } from "node:assert/strict";
import { mock, type Mock } from "node:test";

import { setHtmlLangAttribute } from "../../../../core/locale/internal/localeHandling.js";
import { DE_LOCALE, US_LOCALE } from "../../../utils/localization.js";

describe("core.locale.middlewares", () => {
	describe("setHtmlLangAttribute", () => {
		const defaultLocale = US_LOCALE;

		let htmlElementGetAttributeStub: Mock<typeof HTMLHtmlElement.prototype.getAttribute>;
		let htmlElementSetAttributeSpy: Mock<typeof HTMLHtmlElement.prototype.setAttribute>;

		beforeEach(() => {
			htmlElementGetAttributeStub = mock.method(HTMLHtmlElement.prototype, "getAttribute");
			htmlElementSetAttributeSpy = mock.method(HTMLHtmlElement.prototype, "setAttribute");
		});

		describe("lang attribute is empty", () => {
			it("sets lang attribute to given locale language", () => {
				htmlElementGetAttributeStub.mock.mockImplementation(() => null);
				setHtmlLangAttribute(DE_LOCALE);

				strictEqual(htmlElementSetAttributeSpy.mock.callCount(), 1);
				deepStrictEqual(htmlElementSetAttributeSpy.mock.calls[0].arguments, [
					"lang",
					DE_LOCALE.language
				]);
			});
		});

		describe("lang attribute is already set", () => {
			it("does not change lang attribute when locale language equals lang attribute value", () => {
				htmlElementGetAttributeStub.mock.mockImplementation(() => "en");
				setHtmlLangAttribute(defaultLocale);

				strictEqual(htmlElementSetAttributeSpy.mock.callCount(), 0);
			});
			it("sets lang attribute to new locale language value", () => {
				htmlElementGetAttributeStub.mock.mockImplementation(() => "en");
				setHtmlLangAttribute(DE_LOCALE);

				strictEqual(htmlElementSetAttributeSpy.mock.callCount(), 1);
				deepStrictEqual(htmlElementSetAttributeSpy.mock.calls[0].arguments, [
					"lang",
					DE_LOCALE.language
				]);
			});
		});
	});
});
