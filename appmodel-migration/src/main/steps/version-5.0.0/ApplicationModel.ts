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

import type { Header } from "@com.mgmtp.a12.base/base-model-api/lib/main/header/index.js";
import type { LocalizedModelText } from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";

import type { Model } from "./Model.js";

/**
 * This model can be seen as the UI model for the overall application.
 *
 * It provides a combination of {@link ApplicationModel.Module}s which are high level building blocks of the application and
 * directly accessible via the main menu.
 * Each module consists of an optional {@link ApplicationModel.Menu} entry and a list of {@link ApplicationModel.Case}s. A case describes the link
 * between activities and {@link ApplicationModel.Dashboard.Slot} changes in the UI.
 *
 * @see
 * The Architecture documentation for detailed
 * information about how the UI can be arranged via the {@link ApplicationModel}.
 */
export interface ApplicationModel {
	/**
	 * The `Header` of the model
	 */
	readonly header: Header;

	/**
	 * The content of the application model
	 */
	readonly content: ApplicationModel.ApplicationConfiguration;
}

export namespace ApplicationModel {
	/**
	 * The specific configuration of the Application Model
	 */
	export interface ApplicationConfiguration {
		/**
		 * A composition of {@link Module}s to build up the application.
		 */
		readonly modules: ReadonlyArray<ApplicationModel.Module>;

		/**
		 * The region configuration of the application.
		 */
		readonly region: ApplicationModel.Region;

		/**
		 * This region is used for directives where the region is omitted.
		 */
		readonly defaultRegion: ApplicationModel.Region.Reference;

		/**
		 * The default starting activity of the application.
		 */
		readonly initialActivity?: InitialActivity;
	}

	/**
	 * Describes the start of an activity
	 */
	export interface InitialActivity {
		/**
		 * Descriptor of the activity that is started by default
		 */
		readonly descriptor: {
			readonly [key: string]: string | undefined;
		};
		/**
		 * Whether to skip data loading for this activity,
		 * `false` if not given
		 */
		readonly withoutData?: boolean;
	}

	/**
	 * A module acts as an high-level building block of the overall application.
	 * It describes all the model aspects for a certain domain. The idea here is
	 * that modules can be reused and support code in different applications.
	 */
	export interface Module {
		/**
		 * The name of the module which acts as an identifier and must be unique
		 * among siblings. Note that there can be various modules with different
		 * content which express the same behavior.
		 */
		readonly name: string;

		/**
		 * Each module can provide a menu entry that is automatically shown in the
		 * main menu.
		 */
		readonly menu?: Menu;

		/**
		 * A module usually contains many {@link Flow}s that handle
		 * activities in the respective domain.
		 */
		readonly flows: ReadonlyArray<Flow>;
	}

	/**
	 * This module describes a flow of {@link Scene}s.
	 */
	export interface Flow {
		/**
		 * The name of the flow which acts as an identifier and must be unique
		 * among siblings.
		 */
		readonly name: string;

		/**
		 * {@link Scene}s belonging to this flow.
		 */
		readonly scenes: ReadonlyArray<Scene>;
	}

	/**
	 * A region is a named area in the application's UI. The actual
	 * representation is determined by it's layout. A region can contain
	 * sub-regions.
	 *
	 * Note: The region name must be unique among siblings, i.e. the named
	 *       path to a region must be unique.
	 */
	export interface Region {
		name: string;
		layout: Layout;
		subRegions?: Region[];
	}

	export namespace Region {
		export type Reference = string[];
	}

	/**
	 * It defines the main menu entry of the {@link Module} and which
	 * activity is started when the menu entry is selected.
	 */
	export interface Menu {
		readonly name: string;

		/**
		 * This key-value-map contains texts for different languages that are used
		 * as the label in the main menu of the application.
		 */
		readonly label?: LocalizedModelText;

		/**
		 * It specifies which activity gets started when the menu entry
		 * is selected. Set to undefined, if the menu item should not start
		 * an activity.
		 *
		 * Additionally, the data loading behaviour can be set. By default, the activity
		 * will try to load data.
		 */
		readonly initialActivity?: InitialActivity;

		/**
		 * A menu entry can be linked to a specific permission. Typically, this
		 * is used to hide and show menu entries based on the User's role.
		 */
		readonly permission?: string;

		/**
		 * Sub-entries of the menu.
		 */
		readonly children?: Menu[];
	}

	/**
	 * It defines the actual functionality of a {@link Module}. It describes
	 * the mapping from activities to view assignments in regions
	 */
	export interface Scene {
		/**
		 * The name of the scene which acts as an identifier and must be unique
		 * among siblings.
		 *
		 * Note that the name is not responsible for deciding which scene gets
		 * active at runtime. This is done by the {@link MatchCondition}s.
		 */
		readonly name: string;

		/**
		 * This is used to provide a detailed description. Currently, it is
		 * only used for documentation purposes in the {@link ApplicationModel}.
		 */
		readonly description?: string;

		/**
		 * The prior scene which should be taken into account on evaluating
		 * whether this scene is active or not in addition to the normal
		 * {@link MatchCondition}s check. This scene is only active if its
		 * {@link MatchCondition}s evaluates to true as well as the
		 * {@link MatchCondition}s of its prior scenes.
		 */
		readonly priorScene?: string;

		/**
		 * A list of {@link MatchCondition}s that determine when the {@link Scene}
		 * is active.
		 *
		 * Note that this works together with the priorScene.
		 */
		readonly matchConditions: ReadonlyArray<MatchCondition>;

		/**
		 * Name of a {@link Case} in cases that should be treated as default.
		 */
		readonly defaultCase?: string;

		/**
		 * A scene has optional {@link Case}s to display variants of the current
		 * data.
		 */
		readonly cases?: ReadonlyArray<Case>;

		/**
		 * Describes the changes that happen in the UI.
		 */
		readonly sceneChange?: SceneChange;
	}

	/**
	 * It evaluates a single attribute of the activityDescriptor.
	 * Currently, two kinds of match conditions are supported
	 * * {@link MatchCondition.Equality}
	 * * {@link MatchCondition.Existence}.
	 *
	 * Note that all {@link MatchCondition}s for a scene must evaluate to true
	 * and the same has to apply to its prior scene to activate it.
	 */
	export type MatchCondition = MatchCondition.Equality | MatchCondition.Existence;
	export namespace MatchCondition {
		export interface Base {
			/**
			 * A string to implement the match conditions. The value for the key
			 * can be anything.
			 */
			readonly key: string;
		}

		/**
		 * The equality match condition evaluates to true when the value matches
		 * the given string, otherwise it evaluates to false.
		 */
		export interface Equality extends Base {
			/**
			 * A string to implement the match conditions. The value can be anything.
			 */
			readonly mustEqual: string;
		}

		/**
		 * The existence match condition evaluates to true when a value for the
		 * given key exists, otherwise it evaluates to false.
		 */
		export interface Existence extends Base {
			/**
			 * A boolean to implement the match conditions.
			 */
			readonly isSet: boolean;
		}
	}

	/**
	 * This is an optional feature which can be defined within a {@link Scene}.
	 * All cases operate on the same data specified by the {@link Scene}, but
	 * can represent different parts of it in the UI. They can be seen as
	 * variants or alternative UI components.
	 *
	 * Note that only one case of the {@link Scene} can be active.
	 */
	export interface Case {
		/**
		 * It is used to find a matching case configuration for a given
		 * activity that contains a case.
		 */
		readonly name: string;

		/**
		 * This key-value-map contains texts for different languages that are used
		 * as label for a case menu. Typically, the case menu is shown in
		 * the sidebar region.
		 */
		readonly label?: LocalizedModelText;

		/**
		 * Describes the changes that happen in the UI.
		 */
		readonly sceneChange?: SceneChange;
	}

	/**
	 * This module describes scene changes by {@link Directive}s.
	 */
	export interface SceneChange {
		/**
		 * These {@link Directive}s are executed when a {@link Scene} or
		 * {@link Case} is selected.
		 */
		readonly onEnter?: ReadonlyArray<Directive>;

		/**
		 * These {@link Directive}s are executed when a {@link Scene} or
		 * {@link Case} is followed by a next one, i.e. when a new
		 * activity is created and this causes a new {@link Scene} match.
		 * This group is mainly for preparing for a follow-up situation.
		 */
		readonly onExit?: ReadonlyArray<Directive>;
	}

	/**
	 * These directives describe scene changes.
	 */
	export type Directive = Directive.Add | Directive.Clear;
	export namespace Directive {
		export interface Base {
			/**
			 * A visual location inside the page. If no region is set, the default
			 * region is used.
			 */
			readonly region?: Region.Reference;
		}

		/**
		 * This directive is for adding a view to a certain region.
		 */
		export interface Add extends Base {
			readonly type: "VIEW_ADD";

			/**
			 * It specifies the UI component by name that is to be shown in the
			 * respective view. The name is resolved during view rendering
			 * by looking for a match among the registered UI components.
			 */
			readonly name: string;

			/**
			 * Contains configurable constraints for the layout that was chosen.
			 */
			readonly constraints?: object;

			/**
			 * Contains the configuration for the view that was chosen.
			 */
			readonly configuration?: object;

			/**
			 * All models in this list are loaded when this directive is matched
			 * by the runtime. Model loading is always performed in combination
			 * with data loading.
			 */
			readonly models?: Model.Descriptor[];

			/**
			 * This flag is only required if you want to load data without
			 * having any A12 models.
			 */
			readonly loadData?: boolean;
		}

		/**
		 * This directive is for removing all currently assigned views to a
		 * certain region.
		 */
		export interface Clear extends Base {
			readonly type: "REGION_CLEAR";

			/**
			 * It specifies the layout to be cleared. When the layout is not
			 * provided, the default layout for the respective region is used.
			 */
			readonly layout?: Layout;
		}
	}

	/**
	 * Describes a layout of a {@link Region}.
	 */
	export interface Layout {
		/**
		 * Name of the layout that is used as an identifier.
		 */
		name: string;

		/**
		 * Layout specific settings that provide additional information.
		 *
		 * @example The dashboard layout has information about its row and
		 * column configuration.
		 */
		settings?: object;
	}

	/**
	 * Reference to a scene. Every property refers to an unique name of the
	 * corresponding element.
	 */
	export interface SceneReference {
		readonly moduleName: string;
		readonly flowName: string;
		readonly sceneName: string;
	}

	export namespace MasterDetail {
		/**
		 * Constraints type for a MasterDetail layout
		 */
		export interface ViewConstraint {
			readonly type: "MasterDetail";
			readonly preferredWidth?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
		}

		/** @internal */
		export const MASTER_DETAIL_CONSTRAINTS_TYPE = "MasterDetail";
	}

	export namespace Dashboard {
		/**
		 * Settings definition of the Dashboard layout
		 */
		export interface Settings {
			readonly rows: Row[];

			/** @experimental */
			readonly label?: LocalizedModelText;
		}

		/**
		 * Specifies a row in the layout
		 */
		export interface Row {
			readonly columns: (ContainerColumn | Slot)[];
		}

		/**
		 * Definition a container column
		 */
		export interface ContainerColumn extends Column {
			readonly rows: Row[];
		}

		/**
		 * Definition of a slot
		 */
		export type Slot = Column;

		/**
		 * Definition of a column
		 */
		export interface Column {
			readonly width: {
				readonly sm?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
				readonly md?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
				readonly lg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
			};
		}
	}

	export namespace NullRegion {
		/**
		 * Settings definition of the NullRegion layout
		 */
		export interface Settings {
			/** @experimental */
			readonly label?: LocalizedModelText;
		}
	}

	export namespace ApplicationFrame {
		/**
		 * Settings definition of the ApplicationFrame layout.
		 */
		export interface Settings {
			/**
			 * If set to true the button to trigger the collapsing and expanding
			 * of the sidebar shown at the bottom will not be rendered.
			 */
			readonly disableCollapsingSub?: boolean;
			/**
			 * Defines the initial size of the sidebar.
			 *
			 * * If set to undefined the sidebar will have a normal size
			 * * If set to minimized the sidebar will have an extended size
			 * * If set to maximized the sidebar will be maximized over the whole screen
			 *
			 * Refer to the Widget Documentation ApplicationFrame#subExpandedState for
			 * more information
			 */
			readonly initialSubExpandedState?: "minimized" | "maximized";
			/**
			 * Defines whether the sidebar will be initially expanded.
			 *
			 * * If set to undefined, the sidebar will be expanded
			 * * If set to true, the sidebar will be expanded
			 * * If set to false, the sidebar will be collapsed
			 */
			readonly initialSubExpanded?: boolean;
		}
	}
}
