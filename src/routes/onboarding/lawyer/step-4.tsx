// ============================================
// Step 4: Document Verification
// onboarding/lawyer/step-4.tsx
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useOnboarding } from "@/hooks/use-onboarding";
import { OnboardingLayout } from "@/components/onboarding-layout";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle, X } from "lucide-react";

export const Route = createFileRoute("/onboarding/lawyer/step-4")({
	component: LawyerStep4,
});

type Document = {
	type: "bar-certificate" | "license" | "insurance" | "resume";
	file: File | null;
	status: "pending" | "uploaded";
};

function LawyerStep4() {
	const {
		currentStep,
		totalSteps,
		steps,
		goToNextStep,
		goToPreviousStep,
		goToStep,
	} = useOnboarding("lawyer");

	const [documents, setDocuments] = useState<Record<string, Document>>({
		"bar-certificate": {
			type: "bar-certificate",
			file: null,
			status: "pending",
		},
		license: { type: "license", file: null, status: "pending" },
		insurance: { type: "insurance", file: null, status: "pending" },
		resume: { type: "resume", file: null, status: "pending" },
	});

	const [isUploading, setIsUploading] = useState(false);

	const documentLabels = {
		"bar-certificate": "Bar Certificate",
		license: "Professional License",
		insurance: "Malpractice Insurance",
		resume: "Resume/CV",
	};

	const handleFileChange = async (type: string, file: File | null) => {
		if (file) {
			setDocuments((prev) => ({
				...prev,
				[type]: { type: type as any, file, status: "uploaded" },
			}));
		}
	};

	const removeDocument = (type: string) => {
		setDocuments((prev) => ({
			...prev,
			[type]: { type: type as any, file: null, status: "pending" },
		}));
	};

	const uploadDocuments = async () => {
		setIsUploading(true);

		try {
			const formData = new FormData();

			Object.entries(documents).forEach(([key, doc]) => {
				if (doc.file) {
					formData.append(key, doc.file);
				}
			});

			const response = await fetch("/api/onboarding/documents", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) throw new Error("Upload failed");

			return await response.json();
		} catch (error) {
			console.error("Upload error:", error);
			throw error;
		} finally {
			setIsUploading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Check if at least bar certificate is uploaded
		if (!documents["bar-certificate"].file) {
			alert("Bar certificate is required");
			return;
		}

		try {
			const uploadedDocs = await uploadDocuments();
			await goToNextStep({ documents: uploadedDocs });
		} catch (error) {
			alert("Failed to upload documents. Please try again.");
		}
	};

	return (
		<OnboardingLayout
			currentStep={currentStep}
			totalSteps={totalSteps}
			steps={steps}
			onStepClick={goToStep}
		>
			<div className="bg-white rounded-lg shadow p-8">
				<h1 className="text-2xl font-bold mb-2">Document Verification</h1>
				<p className="text-gray-600 mb-6">
					Upload required documents for verification
				</p>

				<form onSubmit={handleSubmit} className="space-y-6">
					{Object.entries(documents).map(([key, doc]) => (
						<div key={key} className="border rounded-lg p-4">
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center">
									<FileText className="text-gray-400 mr-2" size={20} />
									<div>
										<h3 className="font-medium">
											{documentLabels[key as keyof typeof documentLabels]}
											{key === "bar-certificate" && (
												<span className="text-red-500 ml-1">*</span>
											)}
										</h3>
										<p className="text-sm text-gray-500">
											PDF, JPG, or PNG (Max 10MB)
										</p>
									</div>
								</div>

								{doc.file && (
									<button
										type="button"
										onClick={() => removeDocument(key)}
										className="text-red-500 hover:text-red-700"
									>
										<X size={20} />
									</button>
								)}
							</div>

							{!doc.file ? (
								<label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition">
									<Upload className="text-gray-400 mb-2" size={32} />
									<span className="text-sm text-gray-600">
										Click to upload or drag and drop
									</span>
									<input
										type="file"
										accept=".pdf,.jpg,.jpeg,.png"
										onChange={(e) =>
											handleFileChange(key, e.target.files?.[0] || null)
										}
										className="hidden"
									/>
								</label>
							) : (
								<div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
									<div className="flex items-center">
										<CheckCircle className="text-green-600 mr-2" size={20} />
										<span className="text-sm font-medium text-green-700">
											{doc.file.name}
										</span>
									</div>
									<span className="text-sm text-gray-500">
										{(doc.file.size / 1024 / 1024).toFixed(2)} MB
									</span>
								</div>
							)}
						</div>
					))}

					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<h4 className="font-medium text-blue-900 mb-2">
							Document Review Process
						</h4>
						<ul className="text-sm text-blue-800 space-y-1">
							<li>• Documents are reviewed within 24-48 hours</li>
							<li>• You'll receive an email once verified</li>
							<li>• You can start using the platform while under review</li>
							<li>• Full access granted after verification</li>
						</ul>
					</div>

					<div className="flex justify-between pt-4">
						<Button type="button" variant="outline" onClick={goToPreviousStep}>
							Previous
						</Button>
						<Button type="submit" disabled={isUploading}>
							{isUploading ? "Uploading..." : "Complete Setup"}
						</Button>
					</div>
				</form>
			</div>
		</OnboardingLayout>
	);
}
