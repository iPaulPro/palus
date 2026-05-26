import type { PostFragment } from "@palus/indexer";
import { readContracts } from "@wagmi/core";
import { useCallback, useEffect, useState } from "react";
import { useConfig } from "wagmi";
import { collectorOnlyPostRuleAbi } from "@/data/abis/colletorOnlyPostRuleAbi";
import { followingOnlyPostRuleAbi } from "@/data/abis/followingOnlyPostRuleAbi";
import { CHAIN } from "@/data/constants";
import { CONTRACTS } from "@/data/contracts";
import { useAccountStore } from "@/store/persisted/useAccountStore";

interface PostRuleValidationProps {
  post: PostFragment | undefined;
}

const followingOnlyPostRuleContract = {
  abi: followingOnlyPostRuleAbi,
  address: CONTRACTS.followingOnlyPostRule,
  chainId: CHAIN.id
};

const collectorOnlyPostRuleContract = {
  abi: collectorOnlyPostRuleAbi,
  address: CONTRACTS.collectorOnlyPostRule,
  chainId: CHAIN.id
};

const useCanShare = ({ post }: PostRuleValidationProps) => {
  // react-doctor-disable-next-line react-doctor/rendering-usetransition-loading
  const [isLoading, setIsLoading] = useState(false);
  const [canRepost, setCanRepost] = useState(false);
  const [canQuote, setCanQuote] = useState(false);

  const config = useConfig();
  const { currentAccount } = useAccountStore();

  const validateCanReference = useCallback(async () => {
    if (!currentAccount || !post?.operations || !config) {
      setIsLoading(false);
      setCanRepost(false);
      setCanQuote(false);
      return;
    }

    const canRepostOperation = post.operations.canRepost;
    const canQuoteOperation = post.operations.canQuote;

    const repostPassed =
      canRepostOperation.__typename === "PostOperationValidationPassed";
    const repostFailed =
      canRepostOperation.__typename === "PostOperationValidationFailed";
    const quotePassed =
      canQuoteOperation.__typename === "PostOperationValidationPassed";
    const quoteFailed =
      canQuoteOperation.__typename === "PostOperationValidationFailed";

    if ((repostPassed || repostFailed) && (quotePassed || quoteFailed)) {
      setIsLoading(false);
      setCanRepost(repostPassed);
      setCanQuote(quotePassed);
      return;
    }

    const repostUnknown =
      canRepostOperation.__typename === "PostOperationValidationUnknown";
    const quoteUnknown =
      canQuoteOperation.__typename === "PostOperationValidationUnknown";

    if (!repostUnknown && !quoteUnknown) {
      setIsLoading(false);
      setCanRepost(repostPassed);
      setCanQuote(quotePassed);
      return;
    }

    const hasFollowingOnlyRule =
      repostUnknown &&
      canRepostOperation.extraChecksRequired.find(
        (rule) => rule.address === CONTRACTS.followingOnlyPostRule
      );
    const hasCollectorOnlyRule =
      repostUnknown &&
      canRepostOperation.extraChecksRequired.find(
        (rule) => rule.address === CONTRACTS.collectorOnlyPostRule
      );

    if (!hasFollowingOnlyRule && !hasCollectorOnlyRule) {
      // The rules are actually unknown so we cannot validate
      setIsLoading(false);
      setCanRepost(false);
      setCanQuote(false);
      return;
    }

    setIsLoading(true);
    try {
      const contracts = [];
      const args = [
        post.feed.address,
        post.id,
        currentAccount.address
      ] as const;

      if (hasFollowingOnlyRule && !post.author.operations?.isFollowingMe) {
        contracts.push(
          {
            ...followingOnlyPostRuleContract,
            args,
            functionName: "validateCanRepost"
          } as const,
          {
            ...followingOnlyPostRuleContract,
            args,
            functionName: "validateCanQuote"
          } as const
        );
      }

      if (hasCollectorOnlyRule && !post.operations.hasSimpleCollected) {
        contracts.push(
          {
            ...collectorOnlyPostRuleContract,
            args,
            functionName: "validateCanRepost"
          } as const,
          {
            ...collectorOnlyPostRuleContract,
            args,
            functionName: "validateCanQuote"
          } as const
        );
      }

      if (contracts.length === 0) {
        setIsLoading(false);
        setCanRepost(true);
        setCanQuote(true);
        return;
      }

      const res = await readContracts(config, { contracts });

      let canRepostResult: boolean;
      let canQuoteResult: boolean;

      if (hasFollowingOnlyRule && hasCollectorOnlyRule) {
        // Indices: 0,1 = following (repost, quote), 2,3 = collector (repost, quote)
        canRepostResult = Boolean(res[0].result) && Boolean(res[2].result);
        canQuoteResult = Boolean(res[1].result) && Boolean(res[3].result);
      } else if (hasFollowingOnlyRule) {
        canRepostResult = Boolean(res[0].result);
        canQuoteResult = Boolean(res[1].result);
      } else {
        canRepostResult = Boolean(res[0].result);
        canQuoteResult = Boolean(res[1].result);
      }

      setCanRepost(canRepostResult);
      setCanQuote(canQuoteResult);
    } catch {
      setCanRepost(false);
      setCanQuote(false);
    } finally {
      setIsLoading(false);
    }
  }, [
    config,
    currentAccount,
    post?.operations,
    post?.feed.address,
    post?.id,
    post?.author.operations?.isFollowingMe
  ]);

  useEffect(() => {
    validateCanReference();
  }, [validateCanReference]);

  return {
    canQuote,
    canRepost,
    isLoading
  };
};

export default useCanShare;
