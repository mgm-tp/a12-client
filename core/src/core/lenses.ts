// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

/**
 * Types and basic functions to access and modify state attributes.
 */

/**
 * Type for Getter and setter functions (aka lens) to access an attribute A of a
 * holder S.
 */
export type Lens<S, A> = { get(s: S): A; set(a: A): (s: S) => S };

/**
 * Type for a function that takes a value of type A and returns a new value with the same type.
 */
export type Modifier<A> = (a: A) => A;

/**
 * Function to apply a given modify function on a attribute A using a given Lens
 * that operates on a holder S.
 */
export const modifyWithLens =
	<S, A>(l: Lens<S, A>) =>
	(modify: Modifier<A>) =>
	(s: S) =>
		l.set(modify(l.get(s)))(s);

/**
 * Wrap a given Modifier so that it is only called if a value is given. This
 * functions helps to avoid undefined checks inside the Modifier.
 */
export const modifyIfPresent: <A>(M: Modifier<A>) => Modifier<A | undefined> = m => maybeA =>
	maybeA !== undefined ? m(maybeA) : undefined;
