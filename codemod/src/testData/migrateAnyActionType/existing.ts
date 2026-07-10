import { AnyAction } from "@com.mgmtp.a12.client/typescript-fsa-redux-5-compat";
import { Action } from "redux";

export const dispatchedActions: AnyAction[] = [];
const originalActions: Action = [...dispatchedActions];
