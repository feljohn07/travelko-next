"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  FaUserCog,
  FaCheckCircle,
  FaTimesCircle,
  FaCloudUploadAlt,
  FaInfoCircle,
  FaSlidersH,
  FaFileImage,
  FaSync,
  FaEye,
  FaExclamationTriangle,
  FaArrowLeft,
  FaArrowRight,
  FaCamera,
} from "react-icons/fa";
import { toast } from "react-toastify";

const formatScore = (val) => Math.round(val);

export default function CoordinatorRegisterPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    gender: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const profileInputRef = useRef(null);

  const [idPicture, setIdPicture] = useState(null);
  const [idPicturePreview, setIdPicturePreview] = useState(null);
  const [idFileName, setIdFileName] = useState("");
  const idInputRef = useRef(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [threshold, setThreshold] = useState(65);
  const [activeTab, setActiveTab] = useState("original");
  const [dragActive, setDragActive] = useState(false);

  const canvasRef = useRef(null);
  const edgeCanvasRef = useRef(null);

  const validatePassword = (pwd, confirmPwd) => {
    const errors = [];
    if (pwd.length < 8) errors.push("Min 8 characters");
    if (!/[A-Z]/.test(pwd)) errors.push("1 uppercase letter");
    if (!/[0-9]/.test(pwd)) errors.push("1 number");
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(pwd))
      errors.push("1 special character");
    if (pwd !== confirmPwd) errors.push("Passwords do not match");

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep1 = () => {
    if (
      !form.fullName ||
      !form.username ||
      !form.email ||
      !form.gender ||
      !form.phoneNumber ||
      !form.password ||
      !form.confirmPassword
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const errors = validatePassword(form.password, form.confirmPassword);
    if (errors.length) {
      setPasswordError(errors.join(", "));
      toast.error("Please resolve password validation errors.");
      return;
    }
    setPasswordError("");
    setCurrentStep(2);
  };

  const handleNextStep2 = () => {
    if (!profilePicture) {
      toast.error("Please upload a profile picture before proceeding.");
      return;
    }
    setCurrentStep(3);
  };

  const handleProfileFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file (PNG, JPG, or WebP).");
        return;
      }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePicturePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = useCallback((src, currentThreshold) => {
    setAnalyzing(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      const targetWidth = 600;
      const targetHeight = 400;

      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const data = imageData.data;
      const totalPixels = targetWidth * targetHeight;

      const gray = new Float32Array(totalPixels);
      for (let i = 0; i < data.length; i += 4) {
        gray[i / 4] =
          0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }

      const laplacian = new Float32Array(totalPixels);
      let sum = 0;

      for (let y = 1; y < targetHeight - 1; y++) {
        for (let x = 1; x < targetWidth - 1; x++) {
          const idx = y * targetWidth + x;
          const val =
            gray[idx - targetWidth] +
            gray[idx - 1] +
            -4 * gray[idx] +
            gray[idx + 1] +
            gray[idx + targetWidth];
          laplacian[idx] = val;
          sum += val;
        }
      }

      const mean = sum / totalPixels;

      let varianceSum = 0;
      for (let i = 0; i < laplacian.length; i++) {
        const diff = laplacian[i] - mean;
        varianceSum += diff * diff;
      }
      const variance = varianceSum / totalPixels;
      const isBlurry = variance < currentThreshold;

      const edgeCanvas = edgeCanvasRef.current;
      if (edgeCanvas) {
        edgeCanvas.width = targetWidth;
        edgeCanvas.height = targetHeight;
        const eCtx = edgeCanvas.getContext("2d");
        const edgeImageData = eCtx.createImageData(targetWidth, targetHeight);

        for (let i = 0; i < laplacian.length; i++) {
          const val = Math.min(255, Math.abs(laplacian[i]) * 5);
          const pixelIndex = i * 4;
          edgeImageData.data[pixelIndex] = 16;
          edgeImageData.data[pixelIndex + 1] = 185;
          edgeImageData.data[pixelIndex + 2] = 129;
          edgeImageData.data[pixelIndex + 3] = val;
        }
        eCtx.putImageData(edgeImageData, 0, 0);
      }

      setResult({
        variance: variance,
        isBlurry: isBlurry,
        score: Math.min(100, (variance / 150) * 100),
      });
      setAnalyzing(false);
    };
    img.onerror = () => {
      toast.error("Failed to load image for blur checking.");
      setAnalyzing(false);
    };
  }, []);

  useEffect(() => {
    if (idPicturePreview) {
      const timer = setTimeout(() => {
        runAnalysis(idPicturePreview, threshold);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [threshold, idPicturePreview, runAnalysis]);

  const processIdFile = (file) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, or WebP).");
      return;
    }
    setIdFileName(file.name);
    setIdPicture(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setIdPicturePreview(e.target.result);
      runAnalysis(e.target.result, threshold);
    };
    reader.readAsDataURL(file);
  };

  const handleIdFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processIdFile(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processIdFile(e.dataTransfer.files[0]);
    }
  };

  const generateDemoImage = (blurry) => {
    const demoCanvas = document.createElement("canvas");
    demoCanvas.width = 600;
    demoCanvas.height = 400;
    const ctx = demoCanvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 600, 400);

    ctx.fillStyle = "#1e3a8a";
    ctx.fillRect(0, 0, 600, 85);
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(0, 85, 600, 5);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px Arial, sans-serif";
    ctx.fillText("REPUBLIC OF TRAVELKO", 120, 38);
    ctx.fillStyle = "#93c5fd";
    ctx.font = "bold 11px Arial, sans-serif";
    ctx.fillText("OFFICIAL NATIONAL ADVENTURER CREDENTIAL", 120, 60);

    ctx.beginPath();
    ctx.arc(60, 45, 25, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px Georgia, serif";
    ctx.fillText("TK", 47, 51);

    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(40, 125, 150, 200);
    ctx.strokeStyle = "#e5e7eb";
    ctx.strokeRect(40, 125, 150, 200);

    ctx.fillStyle = "#d1d5db";
    ctx.beginPath();
    ctx.arc(115, 185, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(115, 260, 45, 35, 0, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = "#4b5563";
    ctx.font = "bold 12px Arial, sans-serif";
    ctx.fillText("SURNAME", 220, 145);
    ctx.fillStyle = "#111827";
    ctx.font = "bold 17px Courier New, monospace";
    ctx.fillText("CRUZ", 220, 165);

    ctx.fillStyle = "#4b5563";
    ctx.font = "bold 12px Arial, sans-serif";
    ctx.fillText("GIVEN NAMES", 220, 205);
    ctx.fillStyle = "#111827";
    ctx.font = "bold 17px Courier New, monospace";
    ctx.fillText("JUAN SEBASTIAN", 220, 225);

    ctx.fillStyle = "#4b5563";
    ctx.font = "bold 12px Arial, sans-serif";
    ctx.fillText("DOCUMENT NUMBER", 220, 265);
    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 17px Courier New, monospace";
    ctx.fillText("TK-8854-9921-PH", 220, 285);

    ctx.fillStyle = "#1f2937";
    ctx.fillRect(450, 230, 110, 110);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(460, 240, 25, 25);
    ctx.fillRect(525, 240, 25, 25);
    ctx.fillRect(460, 305, 25, 25);
    ctx.fillStyle = "#000000";
    ctx.fillRect(467, 247, 11, 11);
    ctx.fillRect(532, 247, 11, 11);
    ctx.fillRect(467, 312, 11, 11);

    let url;
    if (blurry) {
      const blurryCanvas = document.createElement("canvas");
      blurryCanvas.width = 600;
      blurryCanvas.height = 400;
      const bCtx = blurryCanvas.getContext("2d");
      bCtx.filter = "blur(7px)";
      bCtx.drawImage(demoCanvas, 0, 0);

      setIdFileName("demo_blurry_id.png");
      url = blurryCanvas.toDataURL("image/png");
    } else {
      setIdFileName("demo_sharp_id.png");
      url = demoCanvas.toDataURL("image/png");
    }

    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File(
          [blob],
          blurry ? "demo_blurry_id.png" : "demo_sharp_id.png",
          { type: "image/png" }
        );
        setIdPicture(file);
      });

    setIdPicturePreview(url);
    runAnalysis(url, threshold);
  };

  const handleRegister = async () => {
    if (currentStep !== 3) {
      toast.error("Please complete the registration steps.");
      return;
    }

    if (!idPicture || result?.isBlurry) {
      toast.error("A clear, non-blurry ID picture is required.");
      return;
    }

    setLoading(true);
    setPasswordError("");

    try {
      const fd = new FormData();
      fd.append("fullName", form.fullName);
      fd.append("username", form.username);
      fd.append("email", form.email);
      fd.append("gender", form.gender);
      fd.append("phoneNumber", form.phoneNumber);
      fd.append("password", form.password);

      if (profilePicture) {
        fd.append("profilePicture", profilePicture);
      }
      if (idPicture) {
        fd.append("idPictures", idPicture);
      }

      await api.post("auth/coordinator", fd);

      setSuccessOpen(true);

      setTimeout(() => {
        setSuccessOpen(false);
        router.replace("/login");
      }, 2000);
    } catch (error) {
      setPasswordError(
        error?.response?.data?.message ||
          error?.message ||
          "Registration failed."
      );
      toast.error(error?.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { num: 1, label: "Account Info" },
      { num: 2, label: "Profile Photo" },
      { num: 3, label: "ID Verification" },
    ];
    return (
      <div className="flex items-center justify-between mb-12 px-4 select-none">
        {steps.map((step, idx) => (
          <div
            key={step.num}
            className="flex items-center flex-1 last:flex-initial"
          >
            <div className="flex flex-col items-center relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm ${
                  currentStep === step.num
                    ? "bg-primary text-white ring-4 ring-primary/20 scale-115 font-extrabold"
                    : currentStep > step.num
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {currentStep > step.num ? (
                  <FaCheckCircle size={16} />
                ) : (
                  step.num
                )}
              </div>
              <span
                className={`text-[10px] md:text-xs font-bold mt-2.5 whitespace-nowrap absolute top-10 transition-colors duration-300 ${
                  currentStep === step.num
                    ? "text-primary"
                    : currentStep > step.num
                    ? "text-emerald-600"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-4 rounded transition-all duration-500 ${
                  currentStep > step.num ? "bg-emerald-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-16">
      <div
        className={`w-full transition-all duration-300 ${
          currentStep === 3 ? "max-w-4xl" : "max-w-xl"
        }`}
      >
        {renderStepIndicator()}

        <div className="bg-primary text-white p-6 rounded-t-2xl shadow-sm mt-4">
          <h2 className="font-extrabold text-2xl">Coordinator Registration</h2>
          <p className="text-primary-foreground opacity-90 text-sm mt-1">
            Create your coordinator account to start listing tour packages
          </p>
        </div>

        <Card className="rounded-b-2xl border-t-0 border-gray-100 shadow-sm overflow-hidden bg-white">
          <CardContent className="p-6 md:p-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRegister();
              }}
              className="space-y-4"
            >
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Full Name *
                    </label>
                    <input
                      name="fullName"
                      type="text"
                      value={form.fullName}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Username *
                    </label>
                    <input
                      name="username"
                      type="text"
                      value={form.username}
                      onChange={handleChange}
                      required
                      placeholder="Enter a unique username"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Email *
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter email address"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      required
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary text-gray-700 font-medium"
                    >
                      <option value="">Select gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Contact Number *
                    </label>
                    <input
                      name="phoneNumber"
                      type="text"
                      value={form.phoneNumber}
                      onChange={handleChange}
                      required
                      placeholder="+63 900 000 0000"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Password *
                    </label>
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      placeholder="Create secure password"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      name="confirmPassword"
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => {
                        handleChange(e);
                        const errors = validatePassword(
                          form.password,
                          e.target.value
                        );
                        setPasswordError(errors.join(", "));
                      }}
                      required
                      placeholder="Re-enter password"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                    {passwordError && (
                      <span className="text-red-550 font-semibold text-xs block mt-1.5 leading-relaxed">
                        ⚠ {passwordError}
                      </span>
                    )}
                  </div>

                  <div className="pt-4 flex justify-between items-center">
                    <div className="text-xs text-gray-400">
                      Have an account?{" "}
                      <Link
                        href="/login"
                        className="text-primary font-bold hover:underline"
                      >
                        Log in here
                      </Link>
                    </div>
                    <Button
                      type="button"
                      onClick={handleNextStep1}
                      className="px-5 py-5 text-xs font-bold bg-primary hover:bg-brand-dark rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 select-none"
                    >
                      Next: Profile Photo <FaArrowRight size={10} />
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6 py-4 flex flex-col items-center">
                  <div className="text-center max-w-sm">
                    <h3 className="text-lg font-bold text-gray-800">
                      Add a Profile Photo
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Upload a clear passport-style photo. This helps
                      administrators approve your application faster and builds
                      trust with travelers.
                    </p>
                  </div>

                  <div
                    onClick={() => profileInputRef.current.click()}
                    className={`relative w-40 h-40 rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden group ${
                      profilePicturePreview
                        ? "border-emerald-500 bg-emerald-50/5 shadow-inner"
                        : "border-gray-300 hover:border-primary hover:bg-gray-50"
                    }`}
                  >
                    <input
                      ref={profileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleProfileFileChange}
                      accept="image/*"
                    />

                    {profilePicturePreview ? (
                      <>
                        <img
                          src={profilePicturePreview}
                          alt="Profile Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold">
                          <FaCamera size={20} className="mb-1" />
                          <span>Change Photo</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-4 flex flex-col items-center text-gray-400">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                          <FaCloudUploadAlt size={20} className="text-gray-400" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-700">
                          Click to Upload
                        </span>
                        <span className="text-[9px] text-gray-400 mt-0.5">
                          PNG, JPG up to 5MB
                        </span>
                      </div>
                    )}
                  </div>

                  {profilePicture && (
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <FaCheckCircle size={12} /> Image Selected
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setProfilePicture(null);
                          setProfilePicturePreview(null);
                        }}
                        className="text-[11px] text-red-500 hover:underline cursor-pointer"
                      >
                        Remove Photo
                      </button>
                    </div>
                  )}

                  <div className="w-full border-t border-gray-100 pt-6 flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="px-5 py-5 text-xs font-bold border-gray-200 hover:bg-gray-50 rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <FaArrowLeft size={10} /> Back
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNextStep2}
                      className="px-5 py-5 text-xs font-bold bg-primary hover:bg-brand-dark rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 select-none"
                    >
                      Next: ID Verification <FaArrowRight size={10} />
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center max-w-lg mx-auto">
                    <h3 className="text-lg font-bold text-gray-800">
                      Identity Document Scan
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Scan your identification credentials client-side using
                      high-frequency edge convolutions. Blurry cards will be
                      rejected immediately to ensure read authenticity.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
                    <div className="lg:col-span-6 space-y-5">
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={
                          idPicturePreview
                            ? undefined
                            : () => idInputRef.current.click()
                        }
                        className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all ${
                          idPicturePreview
                            ? "border-emerald-200 bg-emerald-50/10"
                            : "border-gray-300 hover:border-primary cursor-pointer hover:bg-gray-50/50"
                        } ${dragActive ? "border-primary bg-primary/5" : ""}`}
                      >
                        <input
                          ref={idInputRef}
                          type="file"
                          className="hidden"
                          onChange={handleIdFileChange}
                          accept="image/*"
                        />

                        {idPicturePreview ? (
                          <div className="w-full space-y-3">
                            <div className="relative rounded-xl overflow-hidden shadow-inner border border-gray-150 max-h-[220px] bg-slate-900 flex items-center justify-center">
                              <canvas
                                ref={canvasRef}
                                className={`w-full h-auto object-contain max-h-[220px] ${
                                  activeTab === "original" ? "block" : "hidden"
                                }`}
                              />
                              <canvas
                                ref={edgeCanvasRef}
                                className={`w-full h-auto object-contain max-h-[220px] bg-slate-950 ${
                                  activeTab === "edges" ? "block" : "hidden"
                                }`}
                              />

                              <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-sm rounded-lg p-0.5 flex border border-white/10 z-10">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTab("original");
                                  }}
                                  className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition-colors ${
                                    activeTab === "original"
                                      ? "bg-primary text-white"
                                      : "text-gray-300 hover:text-white"
                                  }`}
                                >
                                  Original
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTab("edges");
                                  }}
                                  className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition-colors flex items-center gap-1 ${
                                    activeTab === "edges"
                                      ? "bg-emerald-600 text-white"
                                      : "text-gray-300 hover:text-white"
                                  }`}
                                >
                                  <FaEye size={9} /> Edges
                                </button>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
                              <span
                                className="truncate max-w-[180px]"
                                title={idFileName}
                              >
                                {idFileName}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    idInputRef.current.click();
                                  }}
                                  className="text-primary hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <FaSync size={10} /> Replace
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIdPicture(null);
                                    setIdPicturePreview(null);
                                    setIdFileName("");
                                    setResult(null);
                                  }}
                                  className="text-red-500 hover:underline cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center space-y-2 py-4">
                            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                              <FaCloudUploadAlt size={24} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-700">
                                Drag & drop your ID image here
                              </p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                PNG, JPG, or WebP up to 10MB
                              </p>
                            </div>
                            <Button
                              type="button"
                              onClick={() => idInputRef.current.click()}
                              className="py-4 px-5 text-[10px] font-bold bg-primary hover:bg-brand-dark rounded-xl cursor-pointer mt-1"
                            >
                              Choose File
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-gray-100 pt-4 space-y-2">
                        <h4 className="text-[11px] font-bold text-gray-500 flex items-center gap-1.5">
                          <FaFileImage className="text-primary" /> Test blur
                          checker with Demo IDs:
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => generateDemoImage(false)}
                            className="py-2.5 px-3 border border-emerald-200 hover:border-emerald-400 bg-emerald-50/20 hover:bg-emerald-50/40 text-emerald-800 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <FaCheckCircle
                              className="text-emerald-600"
                              size={12}
                            />
                            Try Sharp Demo
                          </button>
                          <button
                            type="button"
                            onClick={() => generateDemoImage(true)}
                            className="py-2.5 px-3 border border-rose-200 hover:border-rose-400 bg-rose-50/20 hover:bg-rose-50/40 text-rose-800 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <FaTimesCircle className="text-rose-600" size={12} />
                            Try Blurry Demo
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-4 space-y-2.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-bold text-gray-500 flex items-center gap-1.5 font-semibold">
                            <FaSlidersH className="text-primary" /> Sharpness
                            Threshold
                          </label>
                          <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                            {threshold}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="150"
                          value={threshold}
                          onChange={(e) => setThreshold(Number(e.target.value))}
                          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                    </div>

                    <div className="lg:col-span-6 space-y-4 h-full flex flex-col justify-between">
                      <div className="bg-gray-50 rounded-2xl border border-gray-150 p-4 min-h-[190px] flex flex-col justify-center shadow-inner">
                        {analyzing ? (
                          <div className="text-center py-6 flex flex-col items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-3" />
                            <p className="text-xs font-bold text-gray-700">
                              Convolving image pixels...
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Performing grayscale mapping & Laplacian
                              derivatives.
                            </p>
                          </div>
                        ) : result ? (
                          <div className="space-y-4">
                            {result.isBlurry ? (
                              <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-start gap-3">
                                <FaTimesCircle
                                  className="text-rose-600 shrink-0 mt-0.5"
                                  size={24}
                                />
                                <div>
                                  <h4 className="text-xs font-extrabold text-rose-800">
                                    ID Image Rejected
                                  </h4>
                                  <span className="inline-block mt-0.5 px-2 py-0.5 bg-rose-100 text-rose-700 text-[9px] font-bold rounded-full uppercase">
                                    Blurry Detected
                                  </span>
                                  <p className="text-[10px] text-rose-650 mt-1 leading-normal">
                                    The details are too blurry. Please scan in
                                    better lighting or ensure the card text is
                                    readable.
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                                <FaCheckCircle
                                  className="text-emerald-600 shrink-0 mt-0.5"
                                  size={24}
                                />
                                <div>
                                  <h4 className="text-xs font-extrabold text-emerald-800">
                                    ID Image Accepted
                                  </h4>
                                  <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold rounded-full uppercase font-extrabold">
                                    Sharpness Verified
                                  </span>
                                  <p className="text-[10px] text-emerald-650 mt-1 leading-normal">
                                    High-frequency text features were
                                    successfully verified. Legible details
                                    confirmed.
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="space-y-1.5 pt-1">
                              <div className="flex justify-between text-[11px] font-bold">
                                <span className="text-gray-500">
                                  Sharpness Score
                                </span>
                                <span
                                  className={
                                    result.isBlurry
                                      ? "text-rose-600"
                                      : "text-emerald-600"
                                  }
                                >
                                  {formatScore(result.variance)} Variance
                                </span>
                              </div>
                              <Progress
                                value={result.score}
                                className="h-2"
                                style={{
                                  "--progress-indicator-bg": result.isBlurry
                                    ? "#f43f5e"
                                    : "#10b981",
                                }}
                              />
                            </div>

                            <div className="text-[10px] space-y-1 pt-1.5 border-t border-gray-200">
                              <div className="flex justify-between">
                                <span className="text-gray-400 font-semibold">
                                  Configured Threshold
                                </span>
                                <span className="font-bold text-gray-700">
                                  {threshold}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400 font-semibold">
                                  Verification Status
                                </span>
                                <span
                                  className={`font-bold flex items-center gap-1 ${
                                    result.isBlurry
                                      ? "text-rose-600"
                                      : "text-emerald-600"
                                  }`}
                                >
                                  {result.isBlurry ? (
                                    <>
                                      <FaExclamationTriangle size={10} /> Below
                                      Limit
                                    </>
                                  ) : (
                                    <>
                                      <FaCheckCircle size={10} /> Passed
                                    </>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-400 flex flex-col items-center">
                            <FaInfoCircle size={22} className="text-gray-300 mb-2" />
                            <h5 className="font-bold text-xs text-gray-700">
                              Waiting for Document
                            </h5>
                            <p className="text-[10px] text-gray-400 max-w-xs mt-1 leading-normal">
                              Please upload an ID image or choose one of the
                              mock demo cards on the left panel to scan.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep(2)}
                          className="flex-1 py-5 text-xs font-bold border-gray-200 hover:bg-gray-50 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <FaArrowLeft size={10} /> Back
                        </Button>

                        <Button
                          type="submit"
                          disabled={loading || !idPicture || result?.isBlurry}
                          className="flex-2 py-5 text-xs font-bold bg-primary hover:bg-brand-dark text-white rounded-xl shadow-md cursor-pointer select-none disabled:opacity-50 transition-all duration-200 hover:-translate-y-0.5"
                        >
                          {loading ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Processing...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <FaUserCog /> Complete Registration
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      <Dialog open={successOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md p-6 flex flex-col items-center text-center">
          <FaCheckCircle
            size={70}
            className="text-primary animate-bounce mb-3"
          />
          <h4 className="font-bold text-lg text-gray-900 mb-1">
            Registration Successful!
          </h4>
          <p className="text-gray-450 text-xs mb-3">
            Your coordinator account has been created successfully.
          </p>
          <span className="text-[10px] text-gray-400 font-semibold font-bold">
            Redirecting to login page...
          </span>
        </DialogContent>
      </Dialog>
    </div>
  );
}
