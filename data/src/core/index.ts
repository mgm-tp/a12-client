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

export * from "./api/data-reference.js";
export * from "./api/data/createComputedFieldsDataStructure.js";
export * from "./api/data/getValue.js";
export * from "./api/initializeDataComponent.js";
export * from "./api/model/form-model.js";
export * from "./api/model/modelProcessor.js";
export type * from "./api/model/readonlyObjectMap.js";
export * from "./api/model/relevance/elementState.js";
export * from "./api/model/relevance/filterDataByRelevance.js";
export * from "./api/model/relevance/filterDocumentByRelevance.js";
export * from "./api/model/relevance/isNotRelevant.js";
export type * from "./api/model/relevance/notRelevantConfig.js";
export * from "./api/model/relevance/notRelevantConfigGenerator.js";
export * from "./api/model/unmarshallFormModel.js";
export * from "./api/path/documentPath.js";
export * from "./api/path/documentPathWithAllRepetitions.js";
