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

import type { Annotation, Model, ModelPath } from "@com.mgmtp.a12.base/base-model-api";
import { isModelInstance } from "@com.mgmtp.a12.base/base-model-api";
import type { FieldInstanceValue } from "@com.mgmtp.a12.kernel/kernel-md-facade";

import type { ReadonlyObjectMap } from "./readonlyObjectMap.js";

/**
 * Modified copy of the Form Model typing from the Form Engine.
 *
 * Important: This is only a temporary solution to support dependencies and
 * initial values outside of the Form Engine.
 */
export interface FormModel extends Model {
	readonly content: FormModel.Content;
}

export namespace FormModel {
	/**
	 * Function to check if a given object is an instance of {@link FormModel}.
	 * @param element the object to check
	 */
	export function isInstance(model: object): model is FormModel {
		return isModelInstance(model) && FormModel.Content.isInstance(model.content);
	}

	/** Add annotations to model elements. */
	export interface Annotated {
		readonly annotations?: Annotation[];
	}

	/**
	 * Data structure to define the model content
	 */
	export interface Content {
		/** Element which is shown between the title and the form. */
		readonly subHeaderBox: FormModel.HeaderFooterType;

		/** Element which is shown below the form. */
		readonly footerBox: FormModel.HeaderFooterType;
		/** The screens of the form. */
		readonly screens: ReadonlyArray<FormModel.Screen>;

		/**
		 * Configuration for document model elements.
		 */
		readonly fieldConfiguration: FormModel.FieldConfiguration;

		/**
		 * Configuration for document model groups.
		 */
		readonly groupConfiguration: FormModel.GroupConfiguration;

		/**
		 * Set of defaults which are used if certain parts
		 * are not given (e.g. the label for repeat buttons).
		 */
		readonly defaults: FormModel.Defaults;
	}

	export namespace Content {
		/**
		 * Function to check if a given object is an instance of {@link FormModel.Content}.
		 * @param element the object to check
		 */
		export function isInstance(element: object | FormModel.Content): element is FormModel.Content {
			return "fieldConfiguration" in element && "groupConfiguration" in element;
		}
	}

	/** Data structure to define header and footers. */
	export interface HeaderFooterType {
		/** The unique id. */
		readonly id: string;
	}

	/**
	 * Data structure to represent a screen.
	 */
	export interface Screen extends Annotated {
		readonly id: string;
		readonly name: string;

		/** Children of the screen */
		readonly screenElements: [];
	}

	/**
	 * Default labels for buttons
	 */
	export interface Defaults {}

	/**
	 * Configuration for a document model group.
	 */
	export interface GroupConfiguration {
		/** The configuration for a group */
		readonly group?: ReadonlyArray<GroupConfigurationEntry>;

		/**
		 * Runtime-only lookup map of group configurations.
		 * The group path is used as the key for the map.
		 */
		readonly groupMap: ReadonlyObjectMap<GroupConfigurationEntry>;
	}

	/**
	 * Configuration entry for a document model group.
	 */
	export interface GroupConfigurationEntry extends Annotated {
		/** Sets a dependency for a document model group */
		readonly dependentGroup?: DependentGroup;

		/** The reference to the document model group. */
		readonly groupRef: string;

		/** Runtime-only path to document model group. */
		readonly groupPath: ModelPath;
	}

	/**
	 * Configuration for a document model field.
	 */
	export interface FieldConfiguration {
		/** Configuration for a field. */
		readonly field?: ReadonlyArray<FieldConfigurationEntry>;

		/**
		 * Runtime-only lookup map of field configurations
		 * The field path is used as the key for the map.
		 */
		readonly fieldMap: ReadonlyObjectMap<FieldConfigurationEntry>;
	}

	/**
	 * Configuration entry for a document model field.
	 */
	export interface FieldConfigurationEntry extends Annotated {
		/**
		 * A value which should be shown,
		 * if no value is present in the document for this field
		 */
		readonly initialValue?: string;

		/** Runtime-only JS typed version of initial value */
		readonly initialValueTyped?: FieldInstanceValue;

		/**
		 * Sets a dependency for enumeration values.
		 */
		readonly dependentEnumeration?: DependentEnumeration;

		/** Sets a dependency for a field value */
		readonly dependentField?: DependentField;

		/** Reference to the document model element. */
		readonly elementRef: string;

		/** Runtime-only path to Field */
		readonly elementPath: ModelPath;
	}

	/**
	 * Data structure to define which enumeration values
	 * should be shown dependent on a master field.
	 */
	export interface DependentEnumeration {
		/** Reference to the master field. */
		readonly masterField: string;

		/** Runtime-only path to master Field */
		readonly masterFieldPath: ModelPath;

		/** The constraint which defines the dependency. */
		readonly constraint?: ReadonlyArray<DependentEnumerationConstraint>;
	}

	/**
	 * Constraint for a dependent enumeration.
	 */
	export interface DependentEnumerationConstraint {
		/**
		 * The constraint is fulfilled if the master field
		 * has this value.
		 */
		readonly masterValue: string | null;

		/**
		 * If the constraint is fulfilled these values
		 * are shown inside the Enumeration.
		 */
		readonly constraintValues: ReadonlyArray<{ readonly value: string }>;

		/** This value is set if the master value changes */
		readonly valueForMasterChange?: string;
	}

	/**
	 * Sets a dependency for a group
	 */
	export interface DependentGroup {
		/** Reference to the master field. */
		readonly masterField: string;

		/** Runtime-only path to master Field */
		readonly masterFieldPath: ModelPath;

		/** Defines the dependency */
		readonly case: ReadonlyArray<DependentGroupCase>;
	}

	/**
	 * Data structure to define the dependency for a group.
	 */
	export interface DependentGroupCase {
		/**
		 * Value of the master field for which
		 * the dependency is set.
		 */
		readonly masterValue: string | null;

		/** Runtime-only JS typed version of master value */
		readonly masterValueTyped: FieldInstanceValue;

		/**
		 * Hides the group if the master field has the defined master value.
		 * Removes the group from the document "on save".
		 */
		readonly notRelevant?: boolean;

		/**
		 * Sets the group readonly if the master field
		 * has the defined master value.
		 */
		readonly readonly?: boolean;
	}

	/**
	 * Sets a dependency for a field.
	 */
	export interface DependentField {
		/**
		 * The master field on which the field
		 * is dependent.
		 */
		readonly masterField: string;

		/** Runtime-only JS typed version of master value */
		readonly masterFieldPath: ModelPath;

		/** Defines the dependency */
		readonly case: ReadonlyArray<DependentFieldCase>;
	}

	/**
	 * Data structure to define the dependency field.
	 */
	export interface DependentFieldCase {
		/**
		 * Value of the master field for which
		 * the dependency is set.
		 */
		readonly masterValue: string | null;

		/** Runtime-only JS typed version of master value */
		readonly masterValueTyped: FieldInstanceValue;

		/**
		 * Hides the field if the master field has the defined master value.
		 * Removes the field from the document "on save".
		 */
		readonly notRelevant?: boolean;

		/**
		 * Sets the value of the fields
		 */
		readonly value?: string;

		/** Runtime-only JS typed version of value */
		readonly valueTyped: FieldInstanceValue;

		/**
		 * Reference to the dependent field.
		 */
		readonly fieldRef?: string;

		/** Runtime-only path for the dependent field */
		readonly fieldPath?: ModelPath;
	}
}
