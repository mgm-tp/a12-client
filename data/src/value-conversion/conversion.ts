// SPDX-License-Identifier: EUPL-1.2 OR LicenseRef-commercial
// Copyright (c) 2012-2026 mgm technology partners GmbH
// See LICENSE file for details. For commercial licensing: a12-license@mgm-tp.com

import type { ModelPath } from "@com.mgmtp.a12.base/base-model-api/lib/main/model/index.js";
import { DocumentModel } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/api.js";
import { DocumentServiceFactory } from "@com.mgmtp.a12.kernel/kernel-md-facade/lib/main/js/facade.js";
import type { ValueConversionConfig } from "@com.mgmtp.a12.utils/utils-localization/lib/main/index.js";

// TODO: internal? not used anywhere else
export function conversionConfigForModelPath(
	documentModel: DocumentModel,
	modelPath: ModelPath
): ValueConversionConfig | undefined {
	const timeZone = documentModel.content.modelConfig.timeZone;
	const baseYear = documentModel.content.modelInfo.baseYear;
	const modelElement = new DocumentServiceFactory()
		.getDocumentModelSearchService(documentModel as DocumentModel)
		.getByPath(modelPath);

	if (modelElement?.type === "Field") {
		return {
			...DocumentModel.extractConversionConfig(modelElement.fieldType, timeZone, baseYear),
			modelId: documentModel.header.id,
			modelPath
		};
	}
	return undefined;
}
