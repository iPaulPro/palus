import { Button, Card, H5 } from "@/components/Shared/UI";
import { useCreateGroupStore } from "@/store/non-persisted/modal/useCreateGroupStore";

const CreateGroup = () => {
  const { setShowCreateGroupModal } = useCreateGroupStore();

  return (
    <Card as="aside" className="space-y-4 p-5">
      <div className="space-y-1">
        <H5>Create a group</H5>
        <div>Create a new group on Palus</div>
      </div>
      <Button onClick={() => setShowCreateGroupModal(true)}>
        Create group
      </Button>
    </Card>
  );
};

export default CreateGroup;
