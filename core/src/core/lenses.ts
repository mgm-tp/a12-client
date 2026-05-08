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
