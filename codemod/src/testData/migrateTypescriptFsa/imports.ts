import type { AnyAction } from "typescript-fsa";
import { actionCreatorFactory } from "typescript-fsa";

const actionCreator = actionCreatorFactory("forms");
const test: AnyAction = actionFactory<void>("TEST");
