import { AnyAction } from "redux";
import { Action } from "my-own-actions";

export const dispatchedActions: AnyAction[] = [];
export const localAction: Action = [...dispatchedActions];
