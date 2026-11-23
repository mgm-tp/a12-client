// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { Change, ChangeLog } from "./changeLog/changeLog.js";
import type { DocumentGraph } from "./documentGraph.js";
import type { DeepReadonly } from "./utilityTypes.js";

/* FIXME: should be internal, but is used in DocumentGraph, which is currently public */
export type _ChangeLogT_ = DeepReadonly<DocumentGraph>;

/* FIXME: should be internal, but is used in uiflows */
export interface DgSlice {
	readonly documentGraph: DeepReadonly<DocumentGraph>;
	readonly entryPoint: string | undefined;
}

/* FIXME: should be internal, but is used in uiflows */
export interface DgChangeLogSlice {
	readonly changeLog: DgChangeLog; // <=== own Dataholder and managed by own reducers
}

/** @internal */
export type DgChange = Change<_ChangeLogT_>;

/* FIXME: should be internal, but is used in DocumentGraph, which is currently public */
export type DgChangeLog = ChangeLog<_ChangeLogT_>;
