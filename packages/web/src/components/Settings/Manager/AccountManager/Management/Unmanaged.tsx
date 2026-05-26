import List from "./List";

const Unmanaged = () => {
  return (
    <>
      <div className="p-5">Managed Accounts that you've hidden.</div>
      <div className="divider" />
      <div className="mx-5 my-3">
        <List />
      </div>
    </>
  );
};

export default Unmanaged;
