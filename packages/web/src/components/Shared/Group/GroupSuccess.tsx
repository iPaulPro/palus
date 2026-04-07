import { useEffect } from "react";
import { useNavigate } from "react-router";
import { H4, Image } from "@/components/Shared/UI";
import { STATIC_IMAGES_URL } from "@/data/constants";
import { useCreateGroupStore } from "@/store/non-persisted/modal/useCreateGroupStore";

const GroupSuccess = () => {
  const navigate = useNavigate();
  const { groupAddress, setShowCreateGroupModal } = useCreateGroupStore();

  useEffect(() => {
    setTimeout(() => {
      if (groupAddress) {
        setShowCreateGroupModal(false);
        navigate(`/g/${groupAddress}`);
      }
    }, 3000);
  }, [groupAddress]);

  return (
    <div className="m-8 flex flex-col items-center justify-center">
      <H4>You got your group!</H4>
      <div className="mt-3 text-center font-semibold text-gray-500 dark:text-gray-200">
        Welcome to decentralised social where everything is so much better! 🎉
      </div>
      <Image
        alt="Dizzy emoji"
        className="mx-auto mt-8 size-14"
        height={56}
        src={`${STATIC_IMAGES_URL}/dizzy.webp`}
        width={56}
      />
      <i className="mt-8 text-gray-500 dark:text-gray-200">
        We are taking you to your group...
      </i>
    </div>
  );
};

export default GroupSuccess;
