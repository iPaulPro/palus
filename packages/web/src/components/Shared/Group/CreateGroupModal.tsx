import { group } from "@lens-protocol/metadata";
import { useCreateGroupMutation } from "@palus/indexer";
import { useCallback, useState } from "react";
import { z } from "zod";
import AvatarUpload from "@/components/Shared/AvatarUpload";
import MarkdownEditor from "@/components/Shared/Editor/MarkdownEditor";
import {
  Button,
  Checkbox,
  Form,
  Input,
  useZodForm
} from "@/components/Shared/UI";
import { Regex } from "@/data/regex";
import errorToast from "@/helpers/errorToast";
import uploadMetadata from "@/helpers/uploadMetadata";
import useTransactionLifecycle from "@/hooks/useTransactionLifecycle";
import { useCreateGroupStore } from "@/store/non-persisted/modal/useCreateGroupStore";
import type { ApolloClientError } from "@/types/errors";

const ValidationSchema = z.object({
  description: z.string().max(260, {
    message: "Description should not exceed 260 characters"
  }),
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(50, { message: "Name cannot exceed 50 characters" })
    .regex(Regex.username, {
      message: "Name may contain only alphanumeric characters and hyphens"
    }),
  repliesRestricted: z.boolean()
});

const CreateGroupModal = () => {
  const { setScreen, setTransactionHash } = useCreateGroupStore();
  const [pfpUrl, setPfpUrl] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleTransactionLifecycle = useTransactionLifecycle();

  const form = useZodForm({
    schema: ValidationSchema
  });

  const onCompleted = (hash: string) => {
    setIsSubmitting(false);
    setTransactionHash(hash);
    setScreen("minting");
  };

  const onError = useCallback((error: ApolloClientError) => {
    setIsSubmitting(false);
    errorToast(error);
  }, []);

  const [createGroup] = useCreateGroupMutation({
    onCompleted: async ({ createGroup }) => {
      if (createGroup.__typename === "CreateGroupResponse") {
        return onCompleted(createGroup.hash);
      }

      return await handleTransactionLifecycle({
        onCompleted,
        onError,
        transactionData: createGroup
      });
    },
    onError
  });

  const handleCreateGroup = async (data: z.infer<typeof ValidationSchema>) => {
    setIsSubmitting(true);

    const metadataUri = await uploadMetadata(
      group({
        description: data.description || undefined,
        icon: pfpUrl,
        name: data.name
      })
    );

    return await createGroup({
      variables: {
        request: {
          feed: { repliesRestricted: data.repliesRestricted },
          metadataUri
        }
      }
    });
  };

  return (
    <Form className="space-y-4 p-5" form={form} onSubmit={handleCreateGroup}>
      <Input
        error={!!form.formState.errors.name}
        label="Name"
        placeholder="Name"
        {...form.register("name")}
      />
      <MarkdownEditor
        content={form.getValues("description")}
        label="Description"
        name="description"
        onChange={(value) =>
          form.setValue("description", value, {
            shouldDirty: true,
            shouldValidate: true
          })
        }
        placeholder="Tell us something about your group!"
      />
      <Checkbox
        label="Restrict comments to group members"
        {...form.register("repliesRestricted")}
      />
      <AvatarUpload
        isSmall
        setSrc={(src) => setPfpUrl(src)}
        src={pfpUrl || ""}
      />
      <Button
        className="flex w-full justify-center"
        disabled={isSubmitting}
        loading={isSubmitting}
        type="submit"
      >
        Create group
      </Button>
    </Form>
  );
};

export default CreateGroupModal;
