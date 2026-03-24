import { useMemo } from "react";
import { Button, Image, Tooltip } from "@/components/Shared/UI";
import { CONTRACTS } from "@/data/contracts";
import { formatWithZeroSubscript } from "@/helpers/formatValues";
import getTokenImage from "@/helpers/getTokenImage";
import nFormatter from "@/helpers/nFormatter";

interface Props {
  value: string;
  symbol: string;
  name: string;
  contractAddress: string;
  onClick: () => void;
  buttonLabel: string;
  disabled?: boolean;
}

const TokenBalance = ({
  value,
  symbol,
  name,
  contractAddress,
  onClick,
  buttonLabel,
  disabled = false
}: Props) => {
  const isNative =
    contractAddress === CONTRACTS.wrappedNativeToken ||
    contractAddress === CONTRACTS.nativeToken;

  const isStable =
    contractAddress === CONTRACTS.usdc ||
    contractAddress === CONTRACTS.wrappedNativeToken ||
    contractAddress === CONTRACTS.nativeToken;

  const formattedAmount = useMemo(() => {
    if (!value) return "";

    const num = Number(value);
    if (num > 1_000_000) {
      return nFormatter(num);
    }

    const [, frac = ""] = value.split(".");
    const len = frac.length;
    if (len > 5) return formatWithZeroSubscript(value);

    if (len <= 2) {
      return Intl.NumberFormat().format(num);
    }

    return value;
  }, [value]);

  return (
    <div className="group flex items-center justify-between gap-5 rounded-xl hover:bg-surface sm:p-2">
      <div className="flex min-w-0 items-center gap-2">
        <Image
          alt={symbol}
          className="size-7 flex-none rounded-full border border-border bg-gray-100"
          src={getTokenImage(symbol)}
        />
        <span className="truncate font-bold">
          {name.replace("Token", "")}{" "}
          <span className="text-secondary">
            {symbol !== name ? `(${symbol})` : ""}
          </span>
        </span>
      </div>
      <div className="flex items-center gap-x-3">
        {isNative ? (
          <Button
            disabled={disabled || Number(value) === 0}
            onClick={onClick}
            outline
            size="sm"
          >
            {buttonLabel}
          </Button>
        ) : null}
        <Tooltip content={value}>
          <span className="font-bold">
            {isStable
              ? `$${Intl.NumberFormat("default", {
                  currency: "USD",
                  maximumFractionDigits: 2
                }).format(Number(value))} `
              : formattedAmount}
          </span>
        </Tooltip>
      </div>
    </div>
  );
};

export default TokenBalance;
