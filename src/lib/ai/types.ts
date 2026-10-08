import type { InferUITools, UIDataTypes, UIMessage } from "ai";
import type { FinanceTools } from "./finance-tools";

export type AdvisorUIMessage = UIMessage<never, UIDataTypes, InferUITools<FinanceTools>>;

export const MAX_PROMPT_LENGTH = 2000;
