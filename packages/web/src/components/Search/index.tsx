import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useSearchParams } from "react-router";
import PageLayout from "@/components/Shared/PageLayout";
import { default as SearchInput } from "@/components/Shared/Search";
import Sidebar from "@/components/Shared/Sidebar";
import { EmptyState } from "@/components/Shared/UI";
import Accounts from "./Accounts";
import FeedType, { SearchTabFocus } from "./FeedType";
import Groups from "./Groups";
import Posts from "./Posts";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const type =
    searchParams.get("type") || SearchTabFocus.Accounts.toLowerCase();

  const lowerCaseFeedType = [
    SearchTabFocus.Accounts.toLowerCase(),
    SearchTabFocus.Posts.toLowerCase(),
    SearchTabFocus.Groups.toLowerCase()
  ];

  const getFeedType = (type: string | undefined) => {
    return type && lowerCaseFeedType.includes(type.toLowerCase())
      ? type.toUpperCase()
      : SearchTabFocus.Accounts;
  };

  const feedType = getFeedType(Array.isArray(type) ? type[0] : type);

  return (
    <PageLayout hideSearch sidebar={<Sidebar />} title="Search">
      <div className="px-4 md:px-0">
        <SearchInput autoFocus query={query} />
      </div>
      <FeedType feedType={feedType as SearchTabFocus} />
      {!query && (
        <EmptyState
          icon={<MagnifyingGlassIcon className="size-8" />}
          message="Search for accounts, posts, or groups"
        />
      )}
      {query && feedType === SearchTabFocus.Accounts ? (
        <Accounts query={query as string} />
      ) : null}
      {query && feedType === SearchTabFocus.Posts ? (
        <Posts query={query as string} />
      ) : null}
      {query && feedType === SearchTabFocus.Groups ? (
        <Groups query={query as string} />
      ) : null}
    </PageLayout>
  );
};

export default Search;
