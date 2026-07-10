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
 * @experimental
 *
 * Every export from this file is considered experimental and subject to changes.
 */

import type { Dispatch } from "redux";

import type { Localizable } from "@com.mgmtp.a12.utils/utils-localization";

import type { Activity } from "../../activity/internal/activity.js";
import type { LayoutNG, RegionReferenceNG } from "../../frame/internal/layoutNG/layoutPropsNG.js";
import type { Model } from "../../model/internal/Model.js";
import type { ViewNGComponent } from "../../view/internal/viewNG.js";

export interface DynamicMenu {
	readonly id: string;

	/**
	 * The label in the main menu of the application.
	 */
	readonly label: Localizable;

	/**
	 * Whether the menu entry is currently selected.
	 */
	readonly selected?: boolean;

	/**
	 * The action that is triggered when the menu entry
	 * is selected.
	 */
	readonly action?: (dispatch: Dispatch) => void;

	/**
	 * Sub-entries of the menu.
	 */
	readonly children?: DynamicMenu[];
}

/**
 * A region is a named area in the application's UI. The actual
 * representation is determined by it's layout. A region can contain
 * sub-regions.
 *
 * Note: The region name must be unique among siblings, i.e. the named
 *       path to a region must be unique.
 *
 * A region named with an empty string is considered as the root region.
 * There should only be one root region in your application.
 */
export interface DynamicRegion {
	readonly name: string;
	readonly layout: LayoutNG;
	readonly subRegions?: readonly DynamicRegion[];
}

export interface DynamicFlow {
	/**
	 * The name of the flow which acts as an identifier and must be unique
	 * among siblings.
	 */
	readonly name: string;

	readonly scenes: readonly DynamicScene[];
}

/**
 * A predicate that should return whether the given activity descriptor should match the scene
 */
export type DynamicMatchCondition = (descriptor: Activity.Descriptor) => boolean;

export interface DynamicScene {
	/**
	 * The name of the scene which acts as an identifier and must be unique
	 * among siblings.
	 */
	readonly name: string;

	readonly matches: DynamicMatchCondition;

	/**
	 * Describes the changes that happen in the UI.
	 */
	readonly sceneChange: DynamicSceneChange;

	/**
	 * Name of a {@link DynamicCase} in cases that should be treated as default.
	 */
	readonly defaultCase?: string;

	/**
	 * A scene has optional {@link DynamicCase}s to display variants of the current
	 * data.
	 */
	readonly cases?: readonly DynamicCase[];

	readonly priorScene?: string;
}

export interface DynamicCase {
	/**
	 * It is used to find a matching case configuration for a given
	 * {@link Activity} that contains a case.
	 */
	readonly name: string;

	/**
	 * The label for a case menu. Typically, the case menu is shown in
	 * the sidebar region.
	 */
	readonly label?: Localizable;

	/**
	 * Describes the changes that happen in the UI.
	 */
	readonly sceneChange?: Omit<DynamicSceneChange, "onExit">;
}

export interface DynamicSceneChange {
	/**
	 * These {@link DynamicDirective}s are executed when a {@link DynamicScene} or
	 * {@link DynamicCase} is selected.
	 */
	readonly onEnter?: readonly DynamicDirective[];

	/**
	 * These {@link DynamicDirective}s are executed when a {@link DynamicScene} is followed by a next one, i.e. when a new
	 * {@link Activity} is created and this causes a new {@link DynamicScene} match.
	 * This group is mainly for preparing for a follow-up situation.
	 */
	readonly onExit?: readonly DynamicDirective[];
}

export interface BaseDirective {
	/**
	 * A visual location inside the page.
	 */
	readonly region: RegionReferenceNG;
}

export type DynamicDirective = DynamicAddView | DynamicClearRegion;

export interface DynamicAddView extends BaseDirective {
	readonly type: "DYNAMIC_ADD_VIEW";

	/**
	 * The view component to render
	 */
	readonly component: ViewNGComponent;

	/**
	 * Contains configurable constraints for the layout that was chosen.
	 */
	readonly constraints?: object;

	/**
	 * All models in this list are loaded when this directive is matched
	 * by the runtime. Model loading is always performed in combination
	 * with data loading.
	 */
	readonly models?: Model.Descriptor[];
}

/**
 * This directive removes all currently assigned views to a certain region.
 */
export interface DynamicClearRegion extends BaseDirective {
	readonly type: "DYNAMIC_CLEAR_REGION";

	/**
	 * It specifies the layout that will be used for following view directives. When the layout is not
	 * provided, the default layout for the respective region is used.
	 */
	readonly layout?: LayoutNG;
}
