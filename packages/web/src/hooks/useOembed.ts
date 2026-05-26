import { useQuery } from "@tanstack/react-query";
import { useMediaQuery } from "@uidotdev/usehooks";
import { IS_MOBILE } from "@/helpers/mediaQueries";
import { getOembed } from "@/helpers/oembed";

const useOembed = (url: string) => {
  const isSmallDevice = useMediaQuery(IS_MOBILE);

  return useQuery({
    queryFn: () => getOembed(url, isSmallDevice),
    queryKey: ["oembed", url, isSmallDevice],
    retry: false,
    staleTime: 1000 * 60 * 60 // 1 hour
  });
};

export default useOembed;
