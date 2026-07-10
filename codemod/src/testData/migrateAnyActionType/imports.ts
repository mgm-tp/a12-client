import {
	actionCreatorFactory,
	AnyAction as FsaCompatAnyAction
} from "@com.mgmtp.a12.client/typescript-fsa-redux-5-compat";
import { AnyAction as ReduxAnyAction } from "redux";
import { AnyAction as FsaAnyAction } from "typescript-fsa";

const actionCreator = actionCreatorFactory("forms");

const actionFactory = actionCreator.async<void, void>("TEST");

export const fsaAction: FsaAnyAction = actionFactory.started();
export const fsaCompatAction: FsaCompatAnyAction = actionFactory.started();
export const reduxAction: ReduxAnyAction = actionFactory.started();
