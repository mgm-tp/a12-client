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

/**
 * This file contains a magic key combination that allows for easy switching
 * between production (showcase) and development (extended) mode.
 */

export function registerModeSwitchEventHandlers() {
	let ShiftLeft = false;
	let ShiftRight = false;

	window.addEventListener("keydown", event => {
		if (event.code === "ShiftLeft") {
			ShiftLeft = true;
		} else if (event.code === "ShiftRight") {
			ShiftRight = true;
		}

		if (ShiftLeft && ShiftRight) {
			const mode = localStorage.getItem("mode");
			if (mode === "development") {
				localStorage.removeItem("mode");
			} else {
				localStorage.setItem("mode", "development");
			}

			location.reload();
		}
	});

	window.addEventListener("keyup", event => {
		if (event.code === "ShiftLeft") {
			ShiftLeft = false;
		} else if (event.code === "ShiftRight") {
			ShiftRight = false;
		}
	});
}

/**
 * This function is also called during step tests, where web apis do not exists.
 */
export function isDevelopmentMode(): boolean {
	return typeof localStorage !== "undefined" && localStorage.getItem("mode") === "development";
}
