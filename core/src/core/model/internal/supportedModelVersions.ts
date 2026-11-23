// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

/*
 * mapping from A12 model type to supported version range in npm semver syntax
 * for example:
 * document	27.0.x
 * form		>=37.0.0 <=37.3.0
 * tree		32.x
 **/
export interface SupportedModelVersions {
	readonly [key: string]: string;
}
