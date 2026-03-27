import {
  accountAbi,
  actionHubAbi,
  appAbi,
  feedAbi,
  graphAbi,
  groupAbi,
  namespaceAbi
} from "lens-modules/abis";
import { decodeFunctionData, erc20Abi, type Hex, parseAbi } from "viem";
import { wrappedGhoAbi } from "@/data/abis/wrappedGhoAbi";

interface ABIItem {
  readonly type: string;
  readonly name?: string;
  readonly inputs?: readonly ABIInput[];
}

interface ABIInput {
  readonly name: string;
  readonly type: string;
  readonly components?: readonly ABIInput[];
}

interface DecodedFunction {
  functionName: string;
  args: readonly any[];
}

interface DecodedAction {
  target: string;
  contractType?: string;
  action: string;
  data?: Hex;
  parameters?: Record<string, any>;
  rawData?: string;
  selector?: string;
  error?: string;
  transactionIndex?: number;
}

export interface DecodedTransaction {
  type?: string;
  target?: string;
  value?: string;
  data?: string;
  transactions?: Transaction[];
  decodedActions: DecodedAction[];
  error?: string;
  calldata?: string;
}

interface Transaction {
  target: string;
  value: string;
  data: string;
}

const functionMap = new Map<
  string,
  { abi: readonly ABIItem[]; contractName: string; functionName: string }
>();

function addFunctionsToMap(
  abi: readonly ABIItem[],
  contractName: string
): void {
  for (const item of abi) {
    if (item.type === "function" && item.name) {
      functionMap.set(item.name, {
        abi: [item],
        contractName,
        functionName: item.name
      });
    }
  }
}

addFunctionsToMap([...erc20Abi], "ERC-20");
addFunctionsToMap([...accountAbi], "Account");
addFunctionsToMap([...feedAbi], "Feed");
addFunctionsToMap([...graphAbi], "Graph");
addFunctionsToMap([...groupAbi], "Group");
addFunctionsToMap([...namespaceAbi], "Namespace");
addFunctionsToMap([...appAbi], "App");
addFunctionsToMap([...actionHubAbi], "ActionHub");
addFunctionsToMap([...wrappedGhoAbi], "Wrapped GHO");

export function decodeDelegatedTransaction(calldata: Hex): DecodedTransaction {
  try {
    try {
      const executeTransactionAbi = parseAbi([
        "function executeTransaction(address target, uint256 value, bytes data) returns (bytes)"
      ]);

      const decoded = decodeFunctionData({
        abi: executeTransactionAbi,
        data: calldata
      });

      if (decoded.functionName === "executeTransaction") {
        const result: DecodedTransaction = {
          data: decoded.args[2],
          decodedActions: [],
          target: decoded.args[0],
          type: "executeTransaction",
          value: decoded.args[1].toString()
        };

        const innerAction = decodeInnerAction(decoded.args[0], decoded.args[2]);
        if (innerAction) {
          result.decodedActions.push(innerAction);
        }

        return result;
      }
    } catch {
      // Continue
    }

    try {
      const executeTransactionsAbi = parseAbi([
        "function executeTransactions((address target, uint256 value, bytes data)[] transactions) returns (bytes[])"
      ]);

      const decoded = decodeFunctionData({
        abi: executeTransactionsAbi,
        data: calldata
      }) as DecodedFunction;

      if (decoded.functionName === "executeTransactions") {
        const result: DecodedTransaction = {
          decodedActions: [],
          transactions: decoded.args[0].map((tx: any) => ({
            data: tx.data,
            target: tx.target,
            value: tx.value.toString()
          })),
          type: "executeTransactions"
        };

        decoded.args[0].forEach((tx: any, index: number) => {
          const innerAction = decodeInnerAction(tx.target, tx.data);
          if (innerAction) {
            result.decodedActions.push({
              transactionIndex: index,
              ...innerAction
            });
          }
        });

        return result;
      }
    } catch {
      // Continue
    }

    return {
      calldata,
      decodedActions: [],
      error: "Could not decode as executeTransaction or executeTransactions"
    };
  } catch (error) {
    return {
      calldata,
      decodedActions: [],
      error: `Decoding failed: ${(error as Error).message}`
    };
  }
}

function decodeInnerAction(target: string, data: Hex): DecodedAction {
  try {
    if (!data || data === "0x") {
      return {
        action: "raw_transaction",
        data: data || ("0x" as Hex),
        target
      };
    }

    const selector = data.slice(0, 10);

    // Check if selector matches any parameterless function
    for (const [funcName, { abi, contractName }] of functionMap) {
      const funcItem = abi[0];
      if (
        funcItem.type === "function" &&
        (!funcItem.inputs || funcItem.inputs.length === 0)
      ) {
        try {
          const decoded = decodeFunctionData({
            abi,
            data
          }) as DecodedFunction;

          if (decoded.functionName === funcName) {
            return {
              action: funcName,
              contractType: contractName,
              parameters: {},
              rawData: data,
              target
            };
          }
        } catch {
          // Continue
        }
      }
    }

    const commonFunctions = [
      "createPost",
      "follow",
      "unfollow",
      "addToGroup",
      "removeFromGroup",
      "createGraph",
      "createGroup",
      "createFeed",
      "createApp",
      "mintUsername",
      "tip",
      "collect",
      "executeAccountAction",
      "executePostAction",
      "withdraw",
      "deposit"
    ];

    for (const funcName of commonFunctions) {
      const fun = functionMap.get(funcName);
      if (fun) {
        try {
          const { abi, contractName } = fun;
          const decoded = decodeFunctionData({
            abi,
            data
          }) as DecodedFunction;

          if (decoded.functionName === funcName) {
            return {
              action: funcName,
              contractType: contractName,
              parameters: formatParameters(
                [...decoded.args],
                abi[0].inputs || []
              ),
              rawData: data,
              target
            };
          }
        } catch {
          // Continue
        }
      }
    }

    const abiSets = [
      { abi: erc20Abi, name: "ERC-20" },
      { abi: feedAbi, name: "Feed" },
      { abi: graphAbi, name: "Graph" },
      { abi: groupAbi, name: "Group" },
      { abi: namespaceAbi, name: "Namespace" },
      { abi: appAbi, name: "App" },
      { abi: accountAbi, name: "Account" },
      { abi: actionHubAbi, name: "ActionHub" },
      { abi: wrappedGhoAbi, name: "Wrapped GHO" }
    ];

    for (const { abi, name } of abiSets) {
      if (!abi || !abi.length) continue;

      try {
        const decoded = decodeFunctionData({
          abi,
          data
        }) as DecodedFunction;

        return {
          action: decoded.functionName,
          contractType: name,
          parameters: formatParameters(
            [...decoded.args],
            abi
              .filter((item) => item.type === "function")
              .find((item) => item.name === decoded.functionName)?.inputs || []
          ),
          rawData: data,
          target
        };
      } catch {
        // Continue
      }
    }

    return {
      action: "unknown_function",
      data,
      error: "Could not decode function call",
      selector,
      target
    };
  } catch (error) {
    return {
      action: "decode_error",
      data,
      error: (error as Error).message,
      target
    };
  }
}

function formatParameters(
  args: any[],
  inputs: readonly ABIInput[]
): Record<string, any> {
  if (!args || !inputs) return {};

  const formatted: Record<string, any> = {};

  inputs.forEach((input, index) => {
    if (index >= args.length) return;

    const value = args[index];

    try {
      if (input.type === "address") {
        formatted[input.name] = value;
      } else if (input.type.includes("uint") || input.type.includes("int")) {
        formatted[input.name] =
          typeof value === "bigint" ? value.toString() : String(value);
      } else if (input.type === "bool") {
        formatted[input.name] = Boolean(value);
      } else if (input.type === "string") {
        formatted[input.name] = String(value);
      } else if (input.type === "bytes" || input.type.startsWith("bytes")) {
        formatted[input.name] = value;
      } else if (input.type === "tuple") {
        formatted[input.name] = formatTupleParameters(
          value,
          input.components || []
        );
      } else if (input.type === "tuple[]") {
        formatted[input.name] = Array.isArray(value)
          ? value.map((v) => formatTupleParameters(v, input.components || []))
          : [];
      } else if (input.type.includes("[]")) {
        formatted[input.name] = Array.isArray(value)
          ? value.map((v) => (typeof v === "bigint" ? v.toString() : v))
          : value;
      } else {
        formatted[input.name] = value;
      }
    } catch (error) {
      formatted[input.name] = `<formatting error: ${(error as Error).message}>`;
    }
  });

  return formatted;
}

function formatTupleParameters(
  tupleValue: any,
  components: readonly ABIInput[]
): Record<string, any> {
  if (!tupleValue || !components) return {};

  const formatted: Record<string, any> = {};

  components.forEach((component, index) => {
    const value =
      tupleValue[component.name] !== undefined
        ? tupleValue[component.name]
        : tupleValue[index];

    try {
      if (component.type === "address") {
        formatted[component.name] = value;
      } else if (
        component.type.includes("uint") ||
        component.type.includes("int")
      ) {
        formatted[component.name] =
          typeof value === "bigint" ? value.toString() : String(value);
      } else if (component.type === "bool") {
        formatted[component.name] = Boolean(value);
      } else if (component.type === "string") {
        formatted[component.name] = String(value);
      } else if (
        component.type === "bytes" ||
        component.type.startsWith("bytes")
      ) {
        formatted[component.name] = value;
      } else if (component.type === "tuple") {
        formatted[component.name] = formatTupleParameters(
          value,
          component.components || []
        );
      } else if (component.type === "tuple[]") {
        formatted[component.name] = Array.isArray(value)
          ? value.map((v) =>
              formatTupleParameters(v, component.components || [])
            )
          : [];
      } else if (component.type.includes("[]")) {
        formatted[component.name] = Array.isArray(value)
          ? value.map((v) => (typeof v === "bigint" ? v.toString() : v))
          : value;
      } else {
        formatted[component.name] = value;
      }
    } catch (error) {
      formatted[component.name] =
        `<formatting error: ${(error as Error).message}>`;
    }
  });

  return formatted;
}
