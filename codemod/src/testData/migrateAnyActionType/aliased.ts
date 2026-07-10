import { AnyAction as FsaAnyAction } from "@com.mgmtp.a12.client/typescript-fsa-redux-5-compat";
import { Action as ReduxAction } from "redux";

export const dispatchedActions: FsaAnyAction[] = [];
const originalActions: ReduxAction = [...dispatchedActions];
