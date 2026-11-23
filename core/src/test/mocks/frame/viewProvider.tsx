// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { mock } from "node:test";

import type { JSX } from "react";

import type { View } from "../../../core/view/index.js";

/*
 * ViewProvider for tests with mocks.
 */
export function viewProviderMock(componentName: string): View.ViewComponent {
	return viewFactory(componentName) ?? Placeholder;
}

export function ViewProviderWithNodeMocks() {
	const nodeMocks = Object.fromEntries(
		Object.entries(Views).map(([name, component]) => [name, mock.fn(component)])
	);

	return function viewProvider(componentName: string): View.ViewComponent {
		return nodeMocks[componentName] ?? Placeholder;
	};
}

function Placeholder(props: View): JSX.Element {
	return <div>No view renderer found</div>;
}

function viewFactory(componentName: string): View.ViewComponent | undefined {
	return Views[componentName];
}

const Views: { [name: string]: View.ViewComponent } = {
	SampleComponent,
	ViewA,
	ViewB,
	ViewC,
	ConditionalProgressView
};

export function SampleComponent(props: View): JSX.Element {
	return <div>SampleComponent</div>;
}

export function ViewA(props: View): JSX.Element {
	return <div>ViewA</div>;
}

export function ViewB(props: View): JSX.Element {
	return <div>ViewB</div>;
}

export function ViewC(props: View): JSX.Element {
	return <div>ViewC</div>;
}

function ConditionalProgressView(props: View): JSX.Element {
	return <div>ConditionalProgressView</div>;
}
ConditionalProgressView.handleProgressIndicator = true;

export { ConditionalProgressView };
