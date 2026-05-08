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

export type * from "./types.js";
export * from "./validation-computation/docServiceFactory.js";
export * from "./validation-computation/expandComputedFields.js";
export * from "./validation-computation/expandIndexReferencedFields.js";
export * from "./validation-computation/message.js";
export * from "./validation-computation/messagesForDataContext.js";
export * from "./validation-computation/messagesForFieldReference.js";
export * from "./validation-computation/messageTransformers.js";
export * from "./validation-computation/types.js";
export * from "./validation-computation/validation.js";
export * from "./validation-computation/validationConfig/validationConfig.js";
export * from "./validation-computation/validationRuntimeService.js";
export * from "./validation-computation/validatorProviderFactory.js";
export * from "./values/addRow/createNewGroupInstance.js";
export * from "./values/addRow/getRowCountByPath.js";
export * from "./values/changeValue/changeValue.js";
export * from "./values/changeValue/collectChangedDocumentPaths.js";
export * from "./values/changeValue/computeChangeProperties.js";
export * from "./values/changeValue/computeDocument.js";
export * from "./values/changeValue/parseWithTypeCheck.js";
export * from "./values/changeValue/updateSingleFieldInstance.js";
export * from "./values/changeValue/updateValidationMessages.js";
export * from "./values/documentAndModelsForChange.js";
export * from "./values/handleChangeValue.js";
export * from "./values/handleParsingFailed.js";
export * from "./values/handleRowAdded.js";
export * from "./values/updateDocumentInDg.js";
