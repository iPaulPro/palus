import { MetadataLicenseType } from "@palus/indexer";
import { Select, Tooltip } from "@/components/Shared/UI";
import getAssetLicense from "@/helpers/getAssetLicense";
import { usePostLicenseStore } from "@/store/non-persisted/post/usePostLicenseStore";

type Option = {
  label: string;
  selected: boolean;
  value: MetadataLicenseType;
};

const LicensePicker = () => {
  const { license, setLicense } = usePostLicenseStore();

  const otherOptions: Option[] = Object.values(MetadataLicenseType).reduce<
    Option[]
  >((acc, type) => {
    const assetLicense = getAssetLicense(type);
    if (assetLicense) {
      acc.push({
        label: assetLicense.label ?? "",
        selected: license === type,
        value: type
      });
    }
    return acc;
  }, []);

  const options: {
    label: string;
    selected: boolean;
    value: MetadataLicenseType | null;
  }[] = [
    {
      label: "All rights reserved",
      selected: license === null,
      value: null
    },
    ...otherOptions
  ];

  return (
    <div className="my-5">
      {/* <div className="divider mb-3" /> */}
      <div className="mb-2 flex items-center justify-between">
        <b>License</b>
        <Tooltip
          content={
            <div className="max-w-xs py-2 leading-5">
              Creator licenses dictate the use, sharing, and distribution of
              music, art and other intellectual property - ranging from
              restrictive to permissive. Once given, you can't change the
              license.
            </div>
          }
          placement="top"
        >
          <div className="text-gray-500 text-sm dark:text-gray-200">
            What's this?
          </div>
        </Tooltip>
      </div>
      <Select
        onChange={(value) => setLicense(value as MetadataLicenseType)}
        options={options as any}
      />
      <div className="linkify mt-2 text-gray-500 text-sm dark:text-gray-200">
        {getAssetLicense(license)?.helper ||
          "You are not granting a license to the collector and retain all rights."}
      </div>
    </div>
  );
};

export default LicensePicker;
