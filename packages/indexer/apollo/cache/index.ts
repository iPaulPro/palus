import { InMemoryCache } from '@apollo/client';
import result from '../../possible-types';
import createCursorFieldPolicy from './createCursorFieldPolicy';

const cache = new InMemoryCache({
  possibleTypes: result.possibleTypes,
  typePolicies: {
    AccountManager: { keyFields: ["manager"] },
    Account: { keyFields: ["address"] },
    Group: { keyFields: ["address"] },
    Query: {
      fields: {
        timeline: createCursorFieldPolicy(["request", ["account", "filter"]]),
        following: createCursorFieldPolicy(["request", ["account"]]),
        groupMembers: createCursorFieldPolicy(["request", ["group"]]),
        followers: createCursorFieldPolicy(["request", ["account"]]),
        posts: createCursorFieldPolicy(["request", ["filter", "pageSize"]]),
        postReferences: createCursorFieldPolicy([
          "request",
          ["referencedPost", "referenceTypes", "relevancyFilter", "visibilityFilter"]
        ]),
        postReactions: createCursorFieldPolicy(["request", ["post"]]),
        whoReferencedPost: createCursorFieldPolicy(["request", ["post", "referenceTypes"]]),
        whoExecutedActionOnPost: createCursorFieldPolicy(["request", ["post", "filter", "orderBy"]]),
        postBookmarks: createCursorFieldPolicy(["request", ["filter", "pageSize"]]),
        groups: createCursorFieldPolicy(["request", ["filter", "pageSize"]]),
        accounts: createCursorFieldPolicy(["request", ["filter", "orderBy"]]),
        accountsBlocked: createCursorFieldPolicy(["request", ["pageSize"]]),
        accountManagers: createCursorFieldPolicy(["request", ["pageSize"]]),
        authenticatedSessions: createCursorFieldPolicy(["request", ["pageSize"]]),
        usernames: createCursorFieldPolicy(["request", ["filter", "pageSize"]]),
        notifications: createCursorFieldPolicy(["request", ["filter", "pageSize"]]),
        mlPostsExplore: createCursorFieldPolicy(["request", ["filter", "pageSize"]]),
        mlPostsForYou: createCursorFieldPolicy(["request", ["pageSize"]]),
        groupMembershipRequests: createCursorFieldPolicy(["request", ["group"]]),
        groupStats: createCursorFieldPolicy(["request", ["group"]]),
        adminsFor: createCursorFieldPolicy(["request", ["address"]]),
        groupBannedAccounts: createCursorFieldPolicy(["request", ["group"]]),
      }
    }
  }
});

export default cache;
