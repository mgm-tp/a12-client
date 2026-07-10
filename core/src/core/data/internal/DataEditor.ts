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

import type { Activity } from "../../activity/internal/activity.js";
import type { ApplicationModel } from "../../model/internal/ApplicationModel.js";

/**
 * A DataEditor handles the data exchange between a parent and child activity.
 *
 * @param ParentDataType The type of the parent activity's data
 * @param DataType The type of the exchanged data
 */
export interface DataEditor<ParentDataType = object, DataType = object> {
	/**
	 * {@link DataEditor.Meta} of the editor
	 */
	readonly meta: DataEditor.Meta;

	/**
	 * A function to read data from a given parent {@link Activity} for a child activity to receive it
	 *
	 * @param parentActivity An activity from whose data is read
	 * @param childActivityDescriptor
	 * The {@link Activity.Descriptor} of the child activity, which is the target for the read data
	 *
	 * @returns The read data to be used in the child activity
	 */
	read(parentActivity: Activity, childActivityDescriptor: Activity.Descriptor): DataType;

	/**
	 * A function to write data from a child {@link Activity} back to a parent activity
	 *
	 * @param parentActivity A parent activity, which shall receive the data
	 * @param childActivityDescriptor The {@link Activity.Descriptor} of the child activity, which is the origin of the data
	 * @param data The data to be written back to the parent
	 *
	 * @returns The data of the parent activity after the write back happened
	 */
	write(
		parentActivity: Activity,
		childActivityDescriptor: Activity.Descriptor,
		data: DataType
	): ParentDataType;
}

export namespace DataEditor {
	/**
	 * The meta data of the {@link DataEditor}, which is used to determine,
	 * if this DataEditor is responsible for the data exchange between two activities.
	 */
	export interface Meta {
		/**
		 * The unique name of the DataEditor
		 */
		readonly name: string;

		/**
		 * An array of {@link ApplicationModel.MatchCondition}s. The first of two conditions for the {@link DataEditor} to be
		 * responsible for the data exchange between a parent activity and a child activity is, that every of those
		 * MatchConditions fits to the parent activity's {@link Activity.Descriptor}.
		 */
		readonly parentMatchConditions: ApplicationModel.MatchCondition[];

		/**
		 * An array of {@link ApplicationModel.MatchCondition}s. The second of two conditions for the {@link DataEditor} to be
		 * responsible for the data exchange between a parent activity and a child activity is, that every of those
		 * MatchConditions fits to the child activity's {@link Activity.Descriptor}.
		 */
		readonly childMatchConditions: ApplicationModel.MatchCondition[];
	}
}
