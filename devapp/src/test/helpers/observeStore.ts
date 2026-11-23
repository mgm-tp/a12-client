// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { AnyAction, Store, Unsubscribe } from "redux";

import type { Selector } from "@com.mgmtp.a12.client/client-core";

interface Options {
	readonly store: Store<object, AnyAction>;
	readonly select?: Selector<object>;
	onChange(currentState: object): void;
}

export function observeStore({ store, onChange, select }: Options): Unsubscribe {
	let currentState: object;

	function handleChange(): void {
		const nextState = select ? select(store.getState()) : store.getState();
		if (nextState !== currentState) {
			currentState = nextState;
			onChange(currentState);
		}
	}

	const unsubscribe = store.subscribe(handleChange);
	handleChange();
	return unsubscribe;
}
