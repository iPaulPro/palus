import type { PostFragment } from "@palus/indexer";
import { readContract } from "@wagmi/core";
import { useCallback, useEffect, useState } from "react";
import { useConfig } from "wagmi";
import { collectorOnlyPostRuleAbi } from "@/data/abis/colletorOnlyPostRuleAbi";
import { followingOnlyPostRuleAbi } from "@/data/abis/followingOnlyPostRuleAbi";
import { groupGatedPostRuleAbi } from "@/data/abis/groupGatedPostRuleAbi";
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

const groupGatedPostRuleContract = {
  abi: groupGatedPostRuleAbi,
  address: CONTRACTS.groupGatedPostRule,
  chainId: CHAIN.id
};

const collectorOnlyPostRuleContract = {
  abi: collectorOnlyPostRuleAbi,
  address: CONTRACTS.collectorOnlyPostRule,
  chainId: CHAIN.id
};

const useCanComment = ({ post }: PostRuleValidationProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [canComment, setCanComment] = useState(false);
  const [reason, setReason] = useState<string | null>(null);

  const config = useConfig();
  const { currentAccount } = useAccountStore();

  const validateCanComment = useCallback(async () => {
    if (!currentAccount || !post?.operations) {
      setIsLoading(false);
      setCanComment(false);
      setReason(null);
      return;
    }

    const canCommentOperation = post.operations.canComment;

    if (canCommentOperation.__typename === "PostOperationValidationFailed") {
      setIsLoading(false);
      setCanComment(false);
      setReason(
        canCommentOperation.unsatisfiedRules?.required?.[0].message ?? null
      );
      return;
    }

    if (canCommentOperation.__typename === "PostOperationValidationPassed") {
      setIsLoading(false);
      setCanComment(true);
      setReason(null);
      return;
    }

    if (canCommentOperation.__typename === "PostOperationValidationUnknown") {
      const hasFollowingOnlyRule = canCommentOperation.extraChecksRequired.find(
        (rule) => rule.address === CONTRACTS.followingOnlyPostRule
      );
      const hasGroupGatedRule = canCommentOperation.extraChecksRequired.find(
        (rule) => rule.address === CONTRACTS.groupGatedPostRule
      );
      const hasCollectorOnlyRule = canCommentOperation.extraChecksRequired.find(
        (rule) => rule.address === CONTRACTS.collectorOnlyPostRule
      );

      if (
        !hasFollowingOnlyRule &&
        !hasGroupGatedRule &&
        !hasCollectorOnlyRule
      ) {
        // The rules are actually unknown so we cannot validate
        setIsLoading(false);
        setCanComment(false);
        setReason(null);
        return;
      }

      setIsLoading(true);

      try {
        const args = [
          post.feed.address,
          post.id,
          currentAccount.address
        ] as const;

        if (hasFollowingOnlyRule && !post.author.operations?.isFollowingMe) {
          const res = await readContract(config, {
            ...followingOnlyPostRuleContract,
            args,
            functionName: "validateCanReply"
          });
          if (!res) {
            setCanComment(false);
            setReason(
              "You must be followed by the author of the root post to comment"
            );
            return;
          }
        }

        if (hasGroupGatedRule) {
          const res = await readContract(config, {
            ...groupGatedPostRuleContract,
            args,
            functionName: "validateCanReply"
          });
          if (!res) {
            setCanComment(false);
            setReason("You must be a member of the Group to comment");
            return;
          }
        }

        if (hasCollectorOnlyRule && !post.operations.hasSimpleCollected) {
          const res = await readContract(config, {
            ...collectorOnlyPostRuleContract,
            args,
            functionName: "validateCanReply"
          });
          if (!res) {
            setCanComment(false);
            setReason("You must collect the root Post to comment");
            return;
          }
        }

        setCanComment(true);
        setReason(null);
      } catch {
        setCanComment(false);
        setReason(null);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(false);
    setCanComment(false);
    setReason(null);
  }, [post, config, currentAccount]);

  useEffect(() => {
    validateCanComment();
  }, [validateCanComment]);

  return {
    data: canComment,
    isLoading,
    reason
  };
};

export default useCanComment;
