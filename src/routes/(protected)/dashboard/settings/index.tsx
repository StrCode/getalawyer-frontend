import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { Camera, Loader2, Save, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { UpdateProfileRequest } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { useCountriesWithStates } from "@/hooks/use-countries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator-extended";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  isEmailVerified?: boolean;
  location?: {
    country: string;
    state: string;
  } | null;
}

export const Route = createFileRoute("/(protected)/dashboard/settings/")({
  component: SettingsProfile,
});

export default function SettingsProfile() {
  const queryClient = useQueryClient();

  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [showEmailChangeForm, setShowEmailChangeForm] = useState(false);
  const [emailChangeData, setEmailChangeData] = useState({
    newEmail: "",
    currentPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch user data
  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: api.client.getProfile,
  });

  const showEmailVerification = user?.profile.isEmailVerified !== false;

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with TanStack Form
  const form = useForm({
    defaultValues: {
      name: user?.profile.name || "",
      country: user?.profile.country || "",
      state: user?.profile.state || "",
    },
    onSubmit: async ({ value }) => {
      const profileData: UpdateProfileRequest = {
        name: value.name,
        country: value.country,
        state: value.state,
      };

      try {
        await updateProfileMutation.mutateAsync(profileData);
        // toast.success("Profile updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["user"] });
      } catch (error) {
        // toast.error(error instanceof Error ? error.message : "Failed to update profile");
      }
    },
  });

  // Fetch countries with states using the custom hook
  const {
    data,
    isLoading: countriesLoading,
    isError,
  } = useCountriesWithStates();

  // Safely access the transformed data
  const countries = data?.countries || [];
  const statesByCountry = data?.statesByCountry || {};
  const availableStates = form.state.values.country
    ? statesByCountry[form.state.values.country]
    : [];

  // Update form values when user data loads
  useEffect(() => {
    if (user) {
      form.setFieldValue("name", user.profile.name);
      form.setFieldValue("country", user.profile.country || "");
      form.setFieldValue("state", user.profile.state || "");
      setAvatarPreview(user.profile.image || null);
    }
  });

  // Avatar Upload Mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: api.client.uploadAvatar,
    onSuccess: (imageUrl) => {
      setAvatarPreview(imageUrl);
      toast.success("Profile picture updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Avatar Remove Mutation
  const removeAvatarMutation = useMutation({
    mutationFn: api.client.removeAvatar,
    onSuccess: () => {
      setAvatarPreview(null);
      toast.success("Profile picture removed successfully!");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Profile Update Mutation
  const updateProfileMutation = useMutation({
    mutationFn: api.client.updateProfile,
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Email Change Mutation
  const changeEmailMutation = useMutation({
    mutationFn: ({
      newEmail,
      currentPassword,
    }: {
      newEmail: string;
      currentPassword: string;
    }) => api.client.changeEmail(newEmail, currentPassword),
    onSuccess: () => {
      toast.success(
        "Email changed successfully! Please verify your new email.",
      );
      setEmailChangeData({ newEmail: "", currentPassword: "" });
      setShowEmailChangeForm(false);
      setErrors({});
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: Error) => {
      setErrors({ emailChange: error.message });
      toast.error(error.message);
    },
  });

  const handleAvatarSelect = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload immediately
      uploadAvatarMutation.mutate(file);
    },
    [uploadAvatarMutation],
  );

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarRemove = async () => {
    if (!confirm("Are you sure you want to remove your profile picture?")) {
      return;
    }

    removeAvatarMutation.mutate();
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const file = e.dataTransfer.files[0];
      if (file) {
        handleAvatarSelect(file);
      }
    },
    [handleAvatarSelect],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleAvatarSelect(file);
      }
    },
    [handleAvatarSelect],
  );

  const handleEmailChange = async () => {
    setErrors({});

    if (!emailChangeData.newEmail.trim()) {
      setErrors({ newEmail: "New email is required" });
      toast.error("New email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailChangeData.newEmail)) {
      setErrors({ newEmail: "Please enter a valid email address" });
      toast.error("Please enter a valid email address");
      return;
    }

    if (!emailChangeData.currentPassword.trim()) {
      setErrors({ currentPassword: "Current password is required" });
      toast.error("Current password is required");
      return;
    }

    changeEmailMutation.mutate({
      newEmail: emailChangeData.newEmail,
      currentPassword: emailChangeData.currentPassword,
    });
  };

  const isUploadingAvatar =
    uploadAvatarMutation.isPending || removeAvatarMutation.isPending;
  const isSaving = updateProfileMutation.isPending;
  const isChangingEmailState = changeEmailMutation.isPending;

  if (isLoading) {
    return (
      <Card className="w-full shadow-xs">
        <CardContent className="py-10">
          <div className="flex items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-xs">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <CardTitle className="wrap-break-word">Profile Settings</CardTitle>
            <CardDescription className="wrap-break-word">
              Manage your profile information and avatar
            </CardDescription>
          </div>
          <div className="flex shrink-0 gap-2">
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button
                  className="w-full sm:w-auto"
                  disabled={!canSubmit || isSubmitting || isSaving}
                  onClick={(e) => {
                    e.preventDefault();
                    form.handleSubmit();
                  }}
                  type="button"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span className="whitespace-nowrap">Saving…</span>
                    </>
                  ) : (
                    <>
                      <Save className="size-4" />
                      <span className="whitespace-nowrap">Save Changes</span>
                    </>
                  )}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          {/* Avatar Upload */}
          <div className="flex flex-col gap-4">
            <FieldLabel>Profile Picture</FieldLabel>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div
                className={cn(
                  "relative flex size-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-colors",
                  isUploadingAvatar
                    ? "border-primary bg-primary/5"
                    : "border-muted bg-muted/30 hover:border-primary/50",
                )}
                onClick={handleAvatarClick}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {avatarPreview ? (
                  <>
                    <img
                      alt="Profile avatar"
                      className="object-cover w-full h-full"
                      src={avatarPreview}
                    />
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                        <Loader2 className="size-6 animate-spin text-primary" />
                      </div>
                    )}
                  </>
                ) : (
                  <Camera className="size-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    onClick={handleAvatarClick}
                    type="button"
                    variant="outline"
                    disabled={isUploadingAvatar}
                  >
                    <Camera className="size-4" />
                    {avatarPreview ? "Change Photo" : "Upload Photo"}
                  </Button>
                  {avatarPreview && (
                    <Button
                      onClick={handleAvatarRemove}
                      type="button"
                      variant="outline"
                      disabled={isUploadingAvatar}
                    >
                      <X className="size-4" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-muted-foreground text-xs">
                  Image uploads automatically. Drag and drop or click to browse.
                  Max size: 5MB
                </p>
              </div>
              <input
                accept="image/*"
                className="hidden"
                onChange={handleFileInputChange}
                ref={fileInputRef}
                type="file"
              />
            </div>
          </div>

          <Separator />

          {/* Profile Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <div className="flex flex-col gap-4">
              {/* Name Field */}
              <form.Field name="name">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="name">
                      Name <span className="text-destructive">*</span>
                    </FieldLabel>
                    <FieldContent>
                      <InputGroup>
                        <InputGroupInput
                          id="name"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder="Your full name"
                        />
                      </InputGroup>
                      {field.state.meta.errors && (
                        <FieldError>{field.state.meta.errors[0]}</FieldError>
                      )}
                    </FieldContent>
                  </Field>
                )}
              </form.Field>

              {/* Email Field with Change Option */}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <FieldContent>
                  <div className="flex flex-col gap-2">
                    <InputGroup>
                      <InputGroupInput
                        disabled={showEmailChangeForm}
                        id="email"
                        placeholder="your.email@example.com"
                        type="email"
                        value={user?.profile.email || ""}
                      />
                    </InputGroup>
                    {showEmailVerification && (
                      <Button
                        className="w-full sm:w-auto"
                        onClick={() =>
                          setShowEmailChangeForm(!showEmailChangeForm)
                        }
                        type="button"
                        variant="outline"
                      >
                        {showEmailChangeForm ? "Cancel" : "Change Email"}
                      </Button>
                    )}
                  </div>
                  {!showEmailVerification && (
                    <p className="text-muted-foreground text-xs mt-1">
                      Email cannot be changed from this page
                    </p>
                  )}
                </FieldContent>
              </Field>

              {showEmailChangeForm && (
                <div className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-4">
                  <Field>
                    <FieldLabel htmlFor="new-email">
                      New Email <span className="text-destructive">*</span>
                    </FieldLabel>
                    <FieldContent>
                      <InputGroup>
                        <InputGroupInput
                          id="new-email"
                          onChange={(e) =>
                            setEmailChangeData((prev) => ({
                              ...prev,
                              newEmail: e.target.value,
                            }))
                          }
                          placeholder="new.email@example.com"
                          type="email"
                          value={emailChangeData.newEmail}
                        />
                      </InputGroup>
                      {errors.newEmail && (
                        <FieldError>{errors.newEmail}</FieldError>
                      )}
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="current-password">
                      Current Password{" "}
                      <span className="text-destructive">*</span>
                    </FieldLabel>
                    <FieldContent>
                      <InputGroup>
                        <InputGroupInput
                          id="current-password"
                          onChange={(e) =>
                            setEmailChangeData((prev) => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }))
                          }
                          placeholder="Enter your current password"
                          type="password"
                          value={emailChangeData.currentPassword}
                        />
                      </InputGroup>
                      {errors.currentPassword && (
                        <FieldError>{errors.currentPassword}</FieldError>
                      )}
                      {errors.emailChange && (
                        <FieldError>{errors.emailChange}</FieldError>
                      )}
                    </FieldContent>
                  </Field>

                  <Button
                    className="w-full sm:w-auto"
                    disabled={isChangingEmailState}
                    onClick={handleEmailChange}
                    type="button"
                  >
                    {isChangingEmailState ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Changing…
                      </>
                    ) : (
                      "Update Email"
                    )}
                  </Button>
                </div>
              )}

              <form.Field name="country">
                {(field) => (
                  <Field className="animate-fadeIn">
                    <FieldLabel>Country *</FieldLabel>
                    <Select value={field.state.value} items={countries}>
                      <SelectTrigger
                        className={errors.country ? "border-red-500" : ""}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map(({ label, value }) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </form.Field>

              {/* State Select - Only show if country is selected and has states */}
              {form.state.values.country && availableStates.length > 1 && (
                <form.Field name="state">
                  {(field) => (
                    <Field className="animate-fadeIn">
                      <FieldLabel>State / Region *</FieldLabel>
                      <Select
                        value={form.state.values.state}
                        items={availableStates}
                      >
                        <SelectTrigger
                          className={errors.state ? "border-red-500" : ""}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableStates.map(({ label, value }) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.state && <FieldError>{errors.state}</FieldError>}
                    </Field>
                  )}
                </form.Field>
              )}

              {form.state.values.country && availableStates.length === 1 && (
                <p className="text-gray-500 text-sm">
                  No states or regions are listed for this country.
                </p>
              )}
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
