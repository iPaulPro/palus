import { useState } from "react";
import Managed from "@/components/Settings/Manager/AccountManager/Management/Managed";
import Unmanaged from "@/components/Settings/Manager/AccountManager/Management/Unmanaged";
import { Button, Card, Modal, Tabs } from "@/components/Shared/UI";
import AddAccountManager from "./AddAccountManager";
import Managers from "./Managers";

enum Type {
  MANAGED = "MANAGED",
  MANAGERS = "MANAGERS",
  UNMANAGED = "UNMANAGED"
}

const AccountManager = () => {
  const [type, setType] = useState<Type>(Type.MANAGERS);
  const [showAddManagerModal, setShowAddManagerModal] = useState(false);

  const tabs = [
    { name: "Managers", type: Type.MANAGERS },
    { name: "Managed Accounts", type: Type.MANAGED },
    { name: "Hidden", type: Type.UNMANAGED }
  ];

  return (
    <div className="linkify space-y-3">
      <div className="md:px-2">
        <Tabs
          active={type}
          layoutId="account_manager_tab"
          setActive={(tabType) => {
            const nextType = tabType as Type;
            setType(nextType);
          }}
          tabs={tabs}
        />
      </div>
      <Card>
        {type === Type.MANAGERS && (
          <div className="px-4 pt-5">
            <Button
              className="w-fit"
              onClick={() => setShowAddManagerModal(true)}
              size="sm"
            >
              Add manager
            </Button>
            <Modal
              onClose={() => setShowAddManagerModal(false)}
              show={showAddManagerModal}
              title="Add Account Manager"
            >
              <AddAccountManager
                setShowAddManagerModal={setShowAddManagerModal}
              />
            </Modal>
          </div>
        )}
        {type === Type.MANAGERS && <Managers />}
        {type === Type.MANAGED && <Managed />}
        {type === Type.UNMANAGED && <Unmanaged />}
      </Card>
    </div>
  );
};

export default AccountManager;
