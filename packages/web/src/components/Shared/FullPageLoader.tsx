import { Image } from "@/components/Shared/UI";

const FullPageLoader = () => {
  return (
    <div className="grid h-screen place-items-center">
      <Image
        alt="Logo"
        className="size-28"
        height={112}
        src="/favicon.svg"
        width={112}
      />
    </div>
  );
};

export default FullPageLoader;
