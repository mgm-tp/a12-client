// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { BaseTreeTableNode } from "@com.mgmtp.a12.widgets/widgets-core/lib/tree-table/main/tree-table.api.js";

export interface DependencyTreeTableNode extends BaseTreeTableNode {
	readonly id: string;
	readonly children?: DependencyTreeTableNode[];
}

export interface TreeTableState {
	readonly collapsed: DependencyTreeTableNode[];
}
