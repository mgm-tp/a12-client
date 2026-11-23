// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { strictEqual } from "node:assert/strict";

import { render } from "@testing-library/react";
import type { ComponentType, JSX } from "react";

import type { Module } from "../../../../core/application/index.js";
import { ModuleRegistryProvider } from "../../../../core/application/index.js";
import type { ModuleRegistry } from "../../../../core/application/internal/factories/moduleRegistry.js";
import type { View } from "../../../../core/view/internal/view.js";
import { TestWrapper } from "../../../utils/rtl/testWrapper.js";

function registry(): ModuleRegistry {
	return ModuleRegistryProvider.getInstance();
}

function MockView(text: string): JSX.Element {
	return <div>{text}</div>;
}

function fallback(): ComponentType<View> {
	return () => MockView("Fallback");
}

describe("core.application", () => {
	describe("ModuleRegistryProvider", () => {
		describe("getViewProvider", () => {
			before(() => {
				const module1: Module = {
					id: "module1",
					views: () => name => views1[name]
				};
				const views1: { [name: string]: ComponentType<View> } = {
					Module1Mock: () => MockView("Module1")
				};

				const module2: Module = {
					id: "module2",
					views: () => name => views2[name]
				};
				const views2: { [name: string]: ComponentType<View> } = {
					Module2Mock: () => MockView("DynamicConfiguration")
				};

				registry().addModule(module1);
				registry().addModule(module2);
			});

			it("the view component providers of all registered modules are taken into account", () => {
				const provider = ModuleRegistryProvider.getViewProvider({}, fallback);

				const Module1Component = provider("Module1Mock");
				const Module2Component = provider("Module2Mock");

				const wrapper = render(
					<TestWrapper>
						<Module1Component name="module1" activityId="module1" />
						<Module2Component name="module2" activityId="module2" />
					</TestWrapper>
				);

				strictEqual(wrapper.getAllByText("Module1").length, 1);
				strictEqual(wrapper.getAllByText("DynamicConfiguration").length, 1);
			});

			it("renders the fallback component, if the given component type is not found", () => {
				const provider = ModuleRegistryProvider.getViewProvider({}, fallback);

				const Component = provider("Test");

				const wrapper = render(
					<TestWrapper>
						<Component name="test" activityId="test" />
					</TestWrapper>
				);

				strictEqual(wrapper.getAllByText("Fallback").length, 1);
			});
		});
	});
});
