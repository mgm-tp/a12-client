// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { deepStrictEqual, doesNotThrow, strictEqual, throws } from "node:assert/strict";
import { mock, type Mock } from "node:test";

import type { Module } from "../../../../core/application/index.js";
import { ModuleRegistryProvider } from "../../../../core/application/index.js";
import type { ModuleRegistry } from "../../../../core/application/internal/factories/moduleRegistry.js";
import { ModuleRegistryImpl } from "../../../../core/application/internal/factories/moduleRegistry.js";
import { module1Mock, module2Mock } from "../../../mocks/application/moduleMock.js";

export type ViewKey = string | number | null;

function registry(): ModuleRegistry {
	return ModuleRegistryProvider.getInstance();
}

describe("core.application", () => {
	describe("ModuleRegistry", () => {
		describe("addModule", () => {
			beforeEach(() => {
				registry().addModule(module1Mock);
				registry().addModule(module2Mock);
			});

			afterEach(() => {
				registry().removeModule(module1Mock);
				registry().removeModule(module2Mock);
			});

			it("registers two modules after two modules have been added", () => {
				strictEqual(registry().getAllModules().length, 2);
			});

			it("cannot add a module twice", () => {
				throws(() => {
					registry().addModule(module1Mock);
				});
			});

			it("cannot add a module with the same ID twice", () => {
				throws(() => {
					registry().addModule({ id: module1Mock.id });
				});
			});

			it("can add a previously removed module again", () => {
				doesNotThrow(() => {
					registry().removeModule(module2Mock);
				});
				strictEqual(registry().getAllModules().length, 1);

				doesNotThrow(() => {
					registry().addModule(module2Mock);
				});
				strictEqual(registry().getAllModules().length, 2);
			});
		});

		describe("removeModule", () => {
			beforeEach(() => {
				registry().addModule(module1Mock);
				registry().addModule(module2Mock);
			});

			it("removes two modules after two modules have been added", () => {
				registry().removeModule(module1Mock);
				registry().removeModule(module2Mock);
				strictEqual(registry().getAllModules().length, 0);
			});
		});

		describe("subscribe", () => {
			let eventListenerSpy: Mock<() => {}>;
			let unsubscribe: () => void;

			before(() => {
				eventListenerSpy = mock.fn();
				const r = registry();
				if (r instanceof ModuleRegistryImpl) {
					unsubscribe = r.subscribe(eventListenerSpy);
				}
			});

			after(() => {
				unsubscribe();
			});

			it("calls the subscribed event listener when adding/removing a module", () => {
				const module: Module = {
					id: "Test"
				};

				eventListenerSpy.mock.resetCalls();
				registry().addModule(module);
				registry().removeModule(module);

				strictEqual(eventListenerSpy.mock.callCount(), 2);
				deepStrictEqual(eventListenerSpy.mock.calls.at(0)?.arguments, [
					{ type: "ADD", module: module }
				]);
				deepStrictEqual(eventListenerSpy.mock.calls.at(1)?.arguments, [
					{ type: "REMOVE", module: module }
				]);
			});
		});
	});
});
