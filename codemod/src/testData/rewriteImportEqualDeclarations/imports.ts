import { ApplicationSaga } from "@com.mgmtp.a12.client/client-core/lib/core/application/index.js";
import { DataEditor, DataProvider } from "@com.mgmtp.a12.client/client-core/lib/core/data/index.js";
import { ModelResult } from "@com.mgmtp.a12.client/client-core/lib/core/model/index.js";
import { View } from "@com.mgmtp.a12.client/client-core/lib/core/view/index.js";

import D = DataEditor.Meta;
import C = DataProvider.CanHandleConfig;
import M = ModelResult.ModelLoaded;
import A = ApplicationSaga.Configuration;
import V = View.ErrorBoundaryProvider.FallbackComponentProps;
