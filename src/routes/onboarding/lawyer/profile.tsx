// ============================================
// Step 4: Document Verification
// onboarding/lawyer/step-4.tsx
// ============================================

import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	useLawyerOnboardingStore,
	clearLawyerOnboardingStore,
} from "@/hooks/lawyer-onboarding";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api/client"; // Your API client

export const Route = createFileRoute("/onboarding/lawyer/profile")({
	component: LawyerProfileStep,
});

const DAYS_OF_WEEK = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];

function LawyerProfileStep() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const store = useLawyerOnboardingStore();
	const {
		bio,
		profilePhotoUrl,
		hourlyRate,
		availability,
		casePreferences,
		setBio,
		setProfilePhotoUrl,
		setHourlyRate,
		addAvailabilitySlot,
		removeAvailabilitySlot,
		setCasePreferences,
		resetForm,
	} = store;

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [photoPreview, setPhotoPreview] = useState<string>(
		profilePhotoUrl || "",
	);
	const [uploadingPhoto, setUploadingPhoto] = useState(false);

	// New availability slot state
	const [newSlot, setNewSlot] = useState({
		day: "",
		startTime: "",
		endTime: "",
	});

	const wordCount = bio.trim().split(/\s+/).filter(Boolean).length;
	const minWords = 50;
	const maxWords = 500;

	// Photo upload mutation
	const uploadPhotoMutation = useMutation({
		mutationFn: async (file: File) => {
			const formData = new FormData();
			formData.append("photo", file);
			// Replace with your actual upload endpoint
			const response = await api.uploadProfilePhoto(formData);
			return response.url;
		},
		onSuccess: (url) => {
			setProfilePhotoUrl(url);
			setPhotoPreview(url);
			setErrors((prev) => ({ ...prev, photo: "" }));
		},
		onError: () => {
			setErrors((prev) => ({
				...prev,
				photo: "Failed to upload photo. Please try again.",
			}));
		},
	});

	// Complete onboarding mutation
	const completeMutation = useMutation({
		mutationFn: async (data: any) => {
			return api.lawyer.completeOnBoarding(data);
		},
		onSuccess: (updatedUser) => {
			queryClient.setQueryData(["user", "session"], updatedUser);
			queryClient.setQueryData(["boarding"], {
				success: true,
				onboarding_completed: true,
			});

			resetForm();
			clearLawyerOnboardingStore();
			router.navigate({ to: "/lawyer/dashboard" });
		},
	});

	const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file
		if (!file.type.startsWith("image/")) {
			setErrors((prev) => ({
				...prev,
				photo: "Please select an image file",
			}));
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			setErrors((prev) => ({
				...prev,
				photo: "Image must be less than 5MB",
			}));
			return;
		}

		// Show preview
		const reader = new FileReader();
		reader.onload = (e) => {
			setPhotoPreview(e.target?.result as string);
		};
		reader.readAsDataURL(file);

		// Upload
		setUploadingPhoto(true);
		await uploadPhotoMutation.mutateAsync(file);
		setUploadingPhoto(false);
	};

	const handleAddAvailability = () => {
		if (!newSlot.day || !newSlot.startTime || !newSlot.endTime) {
			setErrors((prev) => ({
				...prev,
				availability: "Please fill all availability fields",
			}));
			return;
		}

		addAvailabilitySlot(newSlot);
		setNewSlot({ day: "", startTime: "", endTime: "" });
		setErrors((prev) => ({ ...prev, availability: "" }));
	};

	const validateAndSubmit = () => {
		const newErrors: Record<string, string> = {};

		if (wordCount < minWords) {
			newErrors.bio = `Bio must be at least ${minWords} words (currently ${wordCount})`;
		}

		if (wordCount > maxWords) {
			newErrors.bio = `Bio must not exceed ${maxWords} words (currently ${wordCount})`;
		}

		if (!profilePhotoUrl) {
			newErrors.photo = "Profile photo is required";
		}

		if (hourlyRate === null || hourlyRate < 0) {
			newErrors.rate = "Please enter a valid consultation rate";
		}

		if (availability.length === 0) {
			newErrors.availability = "Please add at least one availability slot";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		// Submit all data
		const onboardingData = {
			// Step 1
			fullName: store.fullName,
			country: store.country,
			state: store.state,
			city: store.city,
			phoneNumber: store.phoneNumber,

			// Step 2
			barNumber: store.barNumber,
			admissionYear: store.admissionYear,
			lawSchool: store.lawSchool,
			graduationYear: store.graduationYear,
			currentFirm: store.currentFirm,
			yearsOfExperience: store.yearsOfExperience,

			// Step 3
			practiceAreaIds: store.practiceAreas,
			languages: store.languages,

			// Step 4
			bio,
			profilePhotoUrl,
			hourlyRate,
			availability,
			casePreferences,
		};

		completeMutation.mutate(onboardingData);
	};

	const handleBack = () => {
		router.navigate({ to: "/onboarding/lawyer/specializations" });
	};

	return (
		<div className="max-w-4xl mx-auto p-6">
			{/* Progress Bar */}
			<div className="mb-8">
				<div className="flex items-center justify-between mb-2">
					<span className="text-sm font-medium text-gray-700">Step 4 of 4</span>
					<span className="text-sm text-gray-500">Profile & Availability</span>
				</div>
				<div className="w-full bg-gray-200 rounded-full h-2">
					<div className="bg-blue-500 h-2 rounded-full transition-all duration-300 w-full"></div>
				</div>
			</div>

			{/* Header */}
			<div className="text-center mb-8">
				<div className="text-5xl mb-3">👤</div>
				<h2 className="text-2xl font-bold text-gray-900 mb-2">
					Complete Your Profile
				</h2>
				<p className="text-gray-600">
					Help clients get to know you and book consultations
				</p>
			</div>

			<div className="grid md:grid-cols-2 gap-8">
				{/* Left Column */}
				<div className="space-y-6">
					{/* Profile Photo */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Profile Photo *
						</label>
						<div className="flex items-center gap-4">
							<div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
								{photoPreview ? (
									<img
										src={photoPreview}
										alt="Profile preview"
										className="w-full h-full object-cover"
									/>
								) : (
									<span className="text-4xl text-gray-400">👤</span>
								)}
							</div>
							<div>
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									onChange={handlePhotoSelect}
									className="hidden"
								/>
								<Button
									type="button"
									variant="outline"
									onClick={() => fileInputRef.current?.click()}
									disabled={uploadingPhoto}
								>
									{uploadingPhoto ? "Uploading..." : "Upload Photo"}
								</Button>
								<p className="text-xs text-gray-500 mt-1">
									JPG or PNG, max 5MB
								</p>
							</div>
						</div>
						{errors.photo && (
							<p className="text-red-500 text-sm mt-1">{errors.photo}</p>
						)}
					</div>

					{/* Hourly Rate */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Consultation Rate (per hour) *
						</label>
						<div className="flex items-center gap-2">
							<span className="text-gray-600">$</span>
							<Input
								type="number"
								value={hourlyRate || ""}
								onChange={(e) => {
									const value = e.target.value
										? parseFloat(e.target.value)
										: null;
									setHourlyRate(value);
									setErrors((prev) => ({ ...prev, rate: "" }));
								}}
								placeholder="150"
								min="0"
								step="10"
								className={errors.rate ? "border-red-500" : ""}
							/>
						</div>
						{errors.rate && (
							<p className="text-red-500 text-sm mt-1">{errors.rate}</p>
						)}
						<p className="text-xs text-gray-500 mt-1">
							You can offer free consultations by setting this to $0
						</p>
					</div>

					{/* Case Preferences */}
					<div className="space-y-3">
						<h3 className="text-sm font-medium text-gray-700">
							Case Preferences (Optional)
						</h3>
						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								id="remote"
								checked={casePreferences.acceptsRemote}
								onChange={(e) =>
									setCasePreferences({ acceptsRemote: e.target.checked })
								}
								className="rounded"
							/>
							<label htmlFor="remote" className="text-sm text-gray-700">
								Accept remote consultations
							</label>
						</div>
					</div>
				</div>

				{/* Right Column */}
				<div className="space-y-6">
					{/* Bio */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Professional Bio *
						</label>
						<Textarea
							value={bio}
							onChange={(e) => {
								setBio(e.target.value);
								setErrors((prev) => ({ ...prev, bio: "" }));
							}}
							placeholder="Tell potential clients about your legal experience, specialties, and approach to client service..."
							rows={8}
							className={errors.bio ? "border-red-500" : ""}
						/>
						<div className="flex justify-between items-center mt-1">
							<p className="text-xs text-gray-500">
								{wordCount} / {maxWords} words
							</p>
							<p
								className={`text-xs ${
									wordCount < minWords ? "text-red-500" : "text-green-600"
								}`}
							>
								{wordCount < minWords
									? `${minWords - wordCount} more needed`
									: "✓ Minimum reached"}
							</p>
						</div>
						{errors.bio && (
							<p className="text-red-500 text-sm mt-1">{errors.bio}</p>
						)}
					</div>
				</div>
			</div>

			{/* Availability Section */}
			<div className="mt-8">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">
					Availability Schedule *
				</h3>

				{/* Add New Slot */}
				<div className="grid grid-cols-4 gap-3 mb-4">
					<select
						value={newSlot.day}
						onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
						className="p-2 border rounded-lg"
					>
						<option value="">Select day</option>
						{DAYS_OF_WEEK.map((day) => (
							<option key={day} value={day}>
								{day}
							</option>
						))}
					</select>
					<Input
						type="time"
						value={newSlot.startTime}
						onChange={(e) =>
							setNewSlot({ ...newSlot, startTime: e.target.value })
						}
						placeholder="Start"
					/>
					<Input
						type="time"
						value={newSlot.endTime}
						onChange={(e) =>
							setNewSlot({ ...newSlot, endTime: e.target.value })
						}
						placeholder="End"
					/>
					<Button
						type="button"
						onClick={handleAddAvailability}
						variant="outline"
					>
						Add
					</Button>
				</div>

				{errors.availability && (
					<p className="text-red-500 text-sm mb-2">{errors.availability}</p>
				)}

				{/* Current Slots */}
				{availability.length > 0 ? (
					<div className="space-y-2">
						{availability.map((slot, index) => (
							<div
								key={index}
								className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
							>
								<span className="text-sm text-gray-700">
									<strong>{slot.day}</strong>: {slot.startTime} - {slot.endTime}
								</span>
								<button
									onClick={() => removeAvailabilitySlot(index)}
									className="text-red-500 hover:text-red-700 text-sm"
								>
									Remove
								</button>
							</div>
						))}
					</div>
				) : (
					<p className="text-gray-500 text-sm">
						No availability slots added yet
					</p>
				)}
			</div>

			{/* Error Display */}
			{completeMutation.isError && (
				<div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
					Failed to complete onboarding. Please try again.
				</div>
			)}

			{/* Action Buttons */}
			<div className="flex gap-3 mt-8">
				<Button variant="outline" onClick={handleBack} className="w-32">
					← Back
				</Button>
				<Button
					onClick={validateAndSubmit}
					disabled={completeMutation.isPending}
					className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98]"
				>
					{completeMutation.isPending ? "Submitting..." : "Complete Profile →"}
				</Button>
			</div>
		</div>
	);
}
