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
 * 1. Open-Source License - EUPL v1.2
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
 * THIS SOFTWARE IS PROVIDED "AS IS" AND WITHOUT WARRANTY OF ANY KIND,
 * WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NON-INFRINGEMENT, EXCEPT WHERE SUCH DISCLAIMERS ARE HELD TO BE
 * LEGALLY INVALID. SEE THE RESPECTIVE LICENSE TEXT FOR DETAILS.
 */

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
