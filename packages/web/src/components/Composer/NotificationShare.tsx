import {
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import {
  type HTMLAttributes,
  type Ref,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { Image, Tooltip } from "@/components/Shared/UI";
import { WAVE_BACKGROUNDS } from "@/data/waves";
import { componentToPng } from "@/helpers/componentToPng";
import { formatWithZeroSubscript } from "@/helpers/formatValues";
import getAccount from "@/helpers/getAccount";
import getAvatar from "@/helpers/getAvatar";
import { usePostStore } from "@/store/non-persisted/post/usePostStore";
import { useAccountStore } from "@/store/persisted/useAccountStore";

const CARD_WIDTH = 480;
const CARD_HEIGHT = 300;

const NotificationShare = ({
  ref,
  ...props
}: HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> }) => {
  const [bgIndex, setBgIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [amountFontSize, setAmountFontSize] = useState(64);
  const containerRef = useRef<HTMLDivElement>(null);
  const amountRef = useRef<HTMLDivElement>(null);
  const { notificationShare } = usePostStore();
  const { currentAccount } = useAccountStore();

  const value = notificationShare?.amount.value;

  const formattedAmount = useMemo(() => {
    if (!value) return "";

    const [, frac = ""] = value.split(".");
    const len = frac.length;
    if (len > 5) return formatWithZeroSubscript(value);

    const num = Number(value);
    if (len <= 2) {
      return new Intl.NumberFormat("default", {
        minimumFractionDigits: len === 1 ? 2 : 0
      }).format(num);
    }

    return value;
  }, [value]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScale = () => {
      const containerWidth = container.offsetWidth;
      setScale(containerWidth / CARD_WIDTH);
    };

    updateScale();

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  // Calculate optimal font size for amount text
  useEffect(() => {
    const amountEl = amountRef.current;
    if (!amountEl) return;

    const maxFontSize = 80;
    const minFontSize = 16;

    let fontSize = maxFontSize;
    amountEl.style.fontSize = `${fontSize}px`;

    while (
      fontSize > minFontSize &&
      amountEl.scrollWidth > amountEl.offsetWidth
    ) {
      fontSize -= 2;
      amountEl.style.fontSize = `${fontSize}px`;
    }

    setAmountFontSize(fontSize);
  }, [formattedAmount, notificationShare?.amount.asset.symbol]);

  if (!notificationShare || !currentAccount?.username) return null;

  const downloadImage = async () => {
    if (!ref || typeof ref === "function") return;
    const element = ref.current;
    if (!element) return;
    const dataUrl = await componentToPng(element);
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.download = "palus-share.png";
    link.href = dataUrl;
    link.click();
  };

  const account = notificationShare.executedBy;
  const actor = getAccount(account);

  const title =
    notificationShare.type === "collect"
      ? "collected my post"
      : notificationShare.type === "post-tip"
        ? "tipped my post"
        : notificationShare.type === "account-tip" && "tipped me";

  return (
    <div
      className="relative w-full"
      ref={containerRef}
      style={{ height: CARD_HEIGHT * scale }}
    >
      <div
        className={
          "flex h-[300px] w-[480px] origin-top-left flex-col overflow-hidden rounded-xl bg-center bg-cover bg-repeat"
        }
        ref={ref}
        {...props}
        style={{
          backgroundImage: `url("${WAVE_BACKGROUNDS[bgIndex]}")`,
          transform: `scale(${scale})`
        }}
      >
        <div className="flex items-center gap-x-[8px] p-[20px] text-2xl text-white">
          <Image
            alt={actor.username}
            className="size-11 flex-none rounded-full border border-border bg-gray-200 object-cover"
            height={64}
            loading="lazy"
            src={getAvatar(account)}
            width={64}
          />
          <div className="flex w-full flex-col">
            <div className="flex min-w-0 flex-wrap items-center gap-x-1.5">
              <span className="truncate font-bold">{actor.name}</span>
              <span className="truncate pb-0.5 font-semibold text-gray-200">
                @{actor.username}
              </span>
            </div>
            <div className="text-white text-xl">{title}!</div>
          </div>
        </div>
        <div
          className="flex w-[480px] flex-grow items-center pr-[24px] pl-[68px] text-white drop-shadow-black/30 drop-shadow-xs"
          style={{ fontSize: amountFontSize, lineHeight: 1.2 }}
        >
          <div
            className="flex w-full items-center gap-x-[8px] whitespace-nowrap pb-[24px]"
            ref={amountRef}
          >
            <span className="font-bold">
              {notificationShare.amount.__typename === "NativeAmount"
                ? "$"
                : ""}
              {formattedAmount}
            </span>
            <span className="text-gray-200 tracking-tighter">
              {notificationShare.amount.__typename === "Erc20Amount" ? "$" : ""}
              {notificationShare.amount.asset.symbol}
            </span>
          </div>
        </div>
        <div className="flex h-fit flex-none items-center gap-x-[8px] px-[20px] pb-[12px]">
          <Image
            alt="Palus Logo"
            className="mt-0.5 size-[24px]"
            height={24}
            src="/favicon.svg"
            width={24}
          />
          <div className="flex-grow font-semibold text-base text-black opacity-75">{`palus.app/u/${currentAccount.username.localName}`}</div>
          <Image
            alt="Lens Logo"
            className="mt-0.5 size-[24px] drop-shadow-black/30 drop-shadow-xs"
            height={24}
            src="/images/lens.svg"
            width={24}
          />
        </div>
      </div>
      <div className="controls absolute top-3 right-3 flex origin-top-right gap-2">
        <Tooltip content="Previous background" placement="top" withDelay>
          <button
            aria-label="Previous background"
            className="center flex rounded-full bg-black/30 p-2 text-gray-400 hover:text-white"
            onClick={() =>
              setBgIndex(
                (i) =>
                  (i - 1 + WAVE_BACKGROUNDS.length) % WAVE_BACKGROUNDS.length
              )
            }
            type="button"
          >
            <ChevronLeftIcon className="size-3" strokeWidth={4} />
          </button>
        </Tooltip>
        <Tooltip content="Next background" placement="top" withDelay>
          <button
            aria-label="Next background"
            className="center flex rounded-full bg-black/30 p-2 text-gray-400 hover:text-white"
            onClick={() => setBgIndex((i) => (i + 1) % WAVE_BACKGROUNDS.length)}
            type="button"
          >
            <ChevronRightIcon className="size-3" strokeWidth={4} />
          </button>
        </Tooltip>
        <Tooltip content="Download image" placement="top">
          <button
            aria-label="Download"
            className="center flex rounded-full bg-black/30 p-2 text-gray-400 hover:text-white"
            onClick={downloadImage}
            type="button"
          >
            <ArrowDownTrayIcon className="size-3" strokeWidth={3} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default NotificationShare;
