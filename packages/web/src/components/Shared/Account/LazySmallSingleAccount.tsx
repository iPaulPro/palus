import { useAccountQuery } from "@palus/indexer";
import SmallSingleAccountShimmer from "@/components/Shared/Shimmer/SmallSingleAccountShimmer";
import SmallSingleAccount from "./SmallSingleAccount";

interface LazySmallSingleAccountProps {
  hideSlug?: boolean;
  address: string;
  linkToAccount?: boolean;
  smallAvatar?: boolean;
}

const LazySmallSingleAccount = ({
  hideSlug = false,
  address,
  linkToAccount = false,
  smallAvatar = true
}: LazySmallSingleAccountProps) => {
  const { data, loading } = useAccountQuery({
    variables: { request: { address } }
  });

  if (loading) {
    return <SmallSingleAccountShimmer smallAvatar />;
  }

  if (!data?.account) {
    return null;
  }

  return (
    <SmallSingleAccount
      account={data.account}
      hideSlug={hideSlug}
      linkToAccount={linkToAccount}
      smallAvatar={smallAvatar}
    />
  );
};

export default LazySmallSingleAccount;
