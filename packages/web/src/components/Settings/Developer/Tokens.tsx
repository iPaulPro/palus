import BackButton from "@/components/Shared/BackButton";
import { Card, CardHeader, H6 } from "@/components/Shared/UI";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import { hydrateAuthTokens } from "@/store/persisted/useAuthStore";

const Tokens = () => {
  const { accessToken, refreshToken } = hydrateAuthTokens();

  const copyAccessToken = useCopyToClipboard(
    accessToken as string,
    "Copied to clipboard"
  );
  const copyRefreshToken = useCopyToClipboard(
    refreshToken as string,
    "Copied to clipboard"
  );

  return (
    <Card>
      <CardHeader
        icon={<BackButton path="/settings" />}
        title="Your temporary access token"
      />
      <div className="m-5 space-y-5">
        <div className="flex flex-col gap-y-3">
          <b>Your temporary access token</b>
          <button
            className="cursor-pointer break-all rounded-md bg-gray-300 p-2 px-3 text-left dark:bg-gray-600"
            onClick={copyAccessToken}
            type="button"
          >
            <H6>{accessToken}</H6>
          </button>
        </div>
        <div className="flex flex-col gap-y-3">
          <b>Your temporary refresh token</b>
          <button
            className="cursor-pointer break-all rounded-md bg-gray-300 p-2 px-3 text-left dark:bg-gray-600"
            onClick={copyRefreshToken}
            type="button"
          >
            <H6>{refreshToken}</H6>
          </button>
        </div>
      </div>
    </Card>
  );
};

export default Tokens;
