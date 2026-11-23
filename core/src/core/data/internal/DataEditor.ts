// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

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
