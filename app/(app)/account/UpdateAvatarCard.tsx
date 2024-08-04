"use client";

import { AccountCard, AccountCardBody, AccountCardFooter } from "./AccountCard";
import { Input } from "@/components/ui/input";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { updateUser } from "@/lib/actions/users";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";

export function UpdateAvatarCard({ avatar }: { avatar: string }) {
  const [base64Image, setBase64Image] = useState<string | null>(avatar);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      toast.error("Error", { description: error });
      setError(null);
    }
  }, [error]);

  const compressImage = async (file: File): Promise<string> => {
    const options = {
      maxSizeMB: 0.1, // 100KB
      maxWidthOrHeight: 300,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(compressedFile);
      });
    } catch (error) {
      console.error("Error compressing image:", error);
      throw error;
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(fileType)) {
      toast.error("Only png, jpeg, jpg, or webp images are allowed.");
      return;
    }

    try {
      const compressedBase64 = await compressImage(file);
      setBase64Image(compressedBase64);
    } catch (error) {
      toast.error("Error processing image. Please try again.");
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (base64Image) {
      formData.set("avatar", base64Image);
    }
    startTransition(async () => {
      try {
        const result = await updateUser(null, formData);

        if (result.success) {
          toast.success("Updated Profile Picture");
        } else if (result.error) {
          setError(result.error);
        }
      } catch (e) {
        setError("An unexpected error occurred");
      }
    });
  };

  return (
    <AccountCard
      params={{
        header: "Profile Picture",
        description:
          "Upload a profile picture to display on your profile page.",
      }}
    >
      <form onSubmit={handleSubmit}>
        <AccountCardBody>
          <div className="space-y-4">
            {!base64Image && (
              <Input
                type="file"
                name="avatar"
                id="avatar"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleFileChange}
              />
            )}
            {base64Image && (
              <figure className="relative size-24">
                <img
                  src={base64Image}
                  alt="Uploaded Image"
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  className="bg-red-900 rounded-full p-1 absolute top-0 right-0"
                  onClick={() => setBase64Image(null)}
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </figure>
            )}
            <p className="text-muted-foreground">Recommended size: 300x300</p>
          </div>
        </AccountCardBody>
        <AccountCardFooter description="Image will be resized and compressed to max 100KB">
          <Submit hasImage={!!base64Image} isPending={isPending} />
        </AccountCardFooter>
      </form>
    </AccountCard>
  );
}

const Submit = ({
  hasImage,
  isPending,
}: {
  hasImage: boolean;
  isPending: boolean;
}) => {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || isPending || !hasImage}>
      Update Profile Picture
    </Button>
  );
};
