// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import { buildQueries, queryHelpers } from "@testing-library/react";

import { queries as devtoolsQueries } from "@com.mgmtp.a12.devtools/react";

const queryAllByDataType = queryHelpers.queryAllByAttribute.bind(null, "data-type");
const [queryByDataType, getAllByDataType, getByDataType, findAllByDataType, findByDataType] =
	buildQueries(
		queryAllByDataType,
		(_, matcher) => `Found multiple elements by: [data-type=${matcher}]`,
		(_, matcher) => `Unable to find an element by: [data-type="${matcher}"]`
	);

/** @internal */
export const queries = {
	...devtoolsQueries,

	// by type
	queryByDataType,
	queryAllByDataType,
	getByDataType,
	getAllByDataType,
	findByDataType,
	findAllByDataType
};
