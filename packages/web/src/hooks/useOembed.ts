import { useQuery } from "@tanstack/react-query";
import { useMediaQuery } from "@uidotdev/usehooks";
import { getOembed } from "@/helpers/oembed";

const useOembed = (url: string) => {
  const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");

  return useQuery({
    queryFn: () => getOembed(url, isSmallDevice),
    queryKey: ["oembed", url, isSmallDevice],
    retry: false,
    staleTime: 1000 * 60 * 60 // 1 hour
  });
};

export default useOembed;
