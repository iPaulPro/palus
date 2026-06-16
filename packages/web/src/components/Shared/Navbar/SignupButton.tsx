import { useSignupStore } from "@/components/Shared/Auth/Signup";
import { Button } from "@/components/Shared/UI";
import { useAuthModalStore } from "@/store/non-persisted/modal/useAuthModalStore";

interface SignupButtonProps {
  className?: string;
}

const SignupButton = ({ className }: SignupButtonProps) => {
  const { setShowAuthModal } = useAuthModalStore();
  const { setScreen } = useSignupStore();

  return (
    <Button
      className={className}
      onClick={() => {
        setScreen("choose");
        setShowAuthModal(true, "signup");
      }}
      size="md"
      variant="outline"
    >
      Signup
    </Button>
  );
};

export default SignupButton;
