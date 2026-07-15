import { PostRuleExecuteOn, type PostRulesConfigInput } from "@palus/indexer";
import type { RuleState } from "@/components/Composer/ComposerStore";
import { CONTRACTS } from "@/data/contracts";
import { toKeyValueInput } from "@/helpers/keyValueInput";

const postRuleParams = ({
  collectorsOnly,
  followersOnly,
  followingOnly,
  groupGate
}: {
  collectorsOnly?: RuleState;
  followersOnly?: RuleState;
  followingOnly?: RuleState;
  groupGate?: string;
}): PostRulesConfigInput | undefined => {
  if (!followingOnly && !followingOnly && !groupGate && !collectorsOnly) {
    return undefined;
  }

  const rules: PostRulesConfigInput = {};
  rules.required = [];
  if (followersOnly) {
    rules.required.push({
      followersOnlyRule: {
        quotesRestricted: followersOnly.quotesRestricted,
        repliesRestricted: followersOnly.repliesRestricted,
        repostRestricted: followersOnly.repostsRestricted
      }
    });
  }
  if (followingOnly) {
    rules.required.push({
      unknownRule: {
        address: CONTRACTS.followingOnlyPostRule,
        executeOn: [PostRuleExecuteOn.CreatingPost],
        params: [
          toKeyValueInput(
            "lens.param.graph",
            "address",
            CONTRACTS.lensGlobalGraph
          ),
          toKeyValueInput(
            "lens.param.repliesRestricted",
            "bool",
            followingOnly.repliesRestricted
          ),
          toKeyValueInput(
            "lens.param.repostsRestricted",
            "bool",
            followingOnly.repostsRestricted
          ),
          toKeyValueInput(
            "lens.param.quotesRestricted",
            "bool",
            followingOnly.quotesRestricted
          )
        ]
      }
    });
  }
  if (groupGate) {
    rules.required.push({
      unknownRule: {
        address: CONTRACTS.groupGatedPostRule,
        executeOn: [PostRuleExecuteOn.CreatingPost],
        params: [toKeyValueInput("lens.param.group", "address", groupGate)]
      }
    });
  }
  if (collectorsOnly) {
    rules.required.push({
      unknownRule: {
        address: CONTRACTS.collectorOnlyPostRule,
        executeOn: [PostRuleExecuteOn.CreatingPost],
        params: [
          toKeyValueInput(
            "lens.param.collectAction",
            "address",
            CONTRACTS.simpleCollectAction
          ),
          toKeyValueInput(
            "lens.param.repliesRestricted",
            "bool",
            collectorsOnly.repliesRestricted
          ),
          toKeyValueInput(
            "lens.param.repostsRestricted",
            "bool",
            collectorsOnly.repostsRestricted
          ),
          toKeyValueInput(
            "lens.param.quotesRestricted",
            "bool",
            collectorsOnly.quotesRestricted
          )
        ]
      }
    });
  }
  return rules;
};

export default postRuleParams;
