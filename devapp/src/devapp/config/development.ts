// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
