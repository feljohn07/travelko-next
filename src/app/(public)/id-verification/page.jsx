"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FaCloudUploadAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaSlidersH,
  FaFileImage,
  FaSync,
  FaEye,
  FaExclamationTriangle,
} from "react-icons/fa";
import { toast } from "react-toastify";

// Normalizes scores to make it user friendly, but display raw variance too
const formatScore = (val) => Math.round(val);

export default function IdVerificationPage() {
  const [imageSrc, setImageSrc] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null); // { variance, isBlurry, score }
  const [threshold, setThreshold] = useState(65);
  const [fileName, setFileName] = useState("");
  const [activeTab, setActiveTab] = useState("original"); // original, edges
  const [dragActive, setDragActive] = useState(false);

  const canvasRef = useRef(null);
  const edgeCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Main Laplacian Blur Detection Algorithm
  const runAnalysis = useCallback((src, currentThreshold) => {
    setAnalyzing(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      // 1. Set standard internal dimensions for normalized sharpness scores
      const targetWidth = 600;
      const targetHeight = 400;

      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Extract image data
      const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const data = imageData.data;
      const totalPixels = targetWidth * targetHeight;

      // 2. Grayscale conversion using standard luminance weights
      const gray = new Float32Array(totalPixels);
      for (let i = 0; i < data.length; i += 4) {
        gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }

      // 3. Convolve with Laplacian 3x3 kernel:
      // [  0,  1,  0 ]
      // [  1, -4,  1 ]
      // [  0,  1,  0 ]
      const laplacian = new Float32Array(totalPixels);
      let sum = 0;

      for (let y = 1; y < targetHeight - 1; y++) {
        for (let x = 1; x < targetWidth - 1; x++) {
          const idx = y * targetWidth + x;
          const val =
            gray[idx - targetWidth] + // top
            gray[idx - 1] +           // left
            -4 * gray[idx] +          // center
            gray[idx + 1] +           // right
            gray[idx + targetWidth];  // bottom
          laplacian[idx] = val;
          sum += val;
        }
      }

      const mean = sum / totalPixels;

      // 4. Calculate variance of Laplacian values
      let varianceSum = 0;
      for (let i = 0; i < laplacian.length; i++) {
        const diff = laplacian[i] - mean;
        varianceSum += diff * diff;
      }
      const variance = varianceSum / totalPixels;
      const isBlurry = variance < currentThreshold;

      // 5. Draw Glowing Edge Visualization
      const edgeCanvas = edgeCanvasRef.current;
      if (edgeCanvas) {
        edgeCanvas.width = targetWidth;
        edgeCanvas.height = targetHeight;
        const eCtx = edgeCanvas.getContext("2d");
        const edgeImageData = eCtx.createImageData(targetWidth, targetHeight);
        
        for (let i = 0; i < laplacian.length; i++) {
          // Amplify edge pixel values for clear visibility
          const val = Math.min(255, Math.abs(laplacian[i]) * 5); 
          const pixelIndex = i * 4;
          // Emerald Green edge map representation
          edgeImageData.data[pixelIndex] = 16;       // R
          edgeImageData.data[pixelIndex + 1] = 185;   // G
          edgeImageData.data[pixelIndex + 2] = 129;   // B
          edgeImageData.data[pixelIndex + 3] = val;   // A (Alpha relative to sharpness)
        }
        eCtx.putImageData(edgeImageData, 0, 0);
      }

      setResult({
        variance: variance,
        isBlurry: isBlurry,
        score: Math.min(100, (variance / 150) * 100), // percentage gauge representation
      });
      setAnalyzing(false);
    };
    img.onerror = () => {
      toast.error("Failed to load image for blur checking.");
      setAnalyzing(false);
    };
  }, []);

  // Re-run analysis if threshold changes and we have an image loaded
  useEffect(() => {
    if (imageSrc) {
      const timer = setTimeout(() => {
        runAnalysis(imageSrc, threshold);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [threshold, imageSrc, runAnalysis]);

  // Drag & drop handlers
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
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, or WebP).");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target.result);
      runAnalysis(e.target.result, threshold);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const generateDemoImage = (blurry) => {
    // Dynamically draw an ID card to canvas to let users test instantly
    const demoCanvas = document.createElement("canvas");
    demoCanvas.width = 600;
    demoCanvas.height = 400;
    const ctx = demoCanvas.getContext("2d");

    // Clean white card face
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 600, 400);

    // Decorative blue gradient headers
    ctx.fillStyle = "#1e3a8a"; // navy primary
    ctx.fillRect(0, 0, 600, 85);
    ctx.fillStyle = "#3b82f6"; // neon divider strip
    ctx.fillRect(0, 85, 600, 5);

    // Header Typography
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px Arial, sans-serif";
    ctx.fillText("REPUBLIC OF TRAVELKO", 120, 38);
    ctx.fillStyle = "#93c5fd";
    ctx.font = "bold 11px Arial, sans-serif";
    ctx.fillText("OFFICIAL NATIONAL ADVENTURER CREDENTIAL", 120, 60);

    // Circular Logo Badge
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

    // Photo placeholder
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(40, 125, 150, 200);
    ctx.strokeStyle = "#e5e7eb";
    ctx.strokeRect(40, 125, 150, 200);

    // Head outline silhouette in photo
    ctx.fillStyle = "#d1d5db";
    ctx.beginPath();
    ctx.arc(115, 185, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(115, 260, 45, 35, 0, Math.PI, 0);
    ctx.fill();

    // User details fields with clean lettering
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
    ctx.fillStyle = "#ef4444"; // red accents
    ctx.font = "bold 17px Courier New, monospace";
    ctx.fillText("TK-8854-9921-PH", 220, 285);

    // Fake QR Code
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

    // If blurry demo is chosen, apply GPU blur to the final rendered card
    if (blurry) {
      const blurryCanvas = document.createElement("canvas");
      blurryCanvas.width = 600;
      blurryCanvas.height = 400;
      const bCtx = blurryCanvas.getContext("2d");
      bCtx.filter = "blur(7px)"; // Apply noticeable box-blur
      bCtx.drawImage(demoCanvas, 0, 0);

      setFileName("demo_blurry_id.png");
      const url = blurryCanvas.toDataURL("image/png");
      setImageSrc(url);
      runAnalysis(url, threshold);
    } else {
      setFileName("demo_sharp_id.png");
      const url = demoCanvas.toDataURL("image/png");
      setImageSrc(url);
      runAnalysis(url, threshold);
    }
  };

  const resetAll = () => {
    setImageSrc(null);
    setResult(null);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-6xl w-full space-y-8">
        
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            ID Blur Verification
          </h1>
          <p className="mt-2 text-sm text-gray-550 max-w-lg mx-auto">
            Scan your identification credentials client-side using high-frequency edge convolutions. Blurry cards will be rejected immediately to ensure read authenticity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL: UPLOAD AND ADJUSTMENTS */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="rounded-2xl border border-gray-150 shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-primary text-white p-5">
                <CardTitle className="font-bold text-lg">Upload Identity Card</CardTitle>
                <CardDescription className="text-primary-foreground/95 text-[11px] mt-0.5">
                  Secure local scanning. No image file ever leaves your browser.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6">
                
                {/* Upload drag zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={imageSrc ? undefined : handleUploadClick}
                  className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${
                    imageSrc ? "border-emerald-200 bg-emerald-50/10" : "border-gray-300 hover:border-primary cursor-pointer hover:bg-gray-50/50"
                  } ${dragActive ? "border-primary bg-primary/5" : ""}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*"
                  />

                  {imageSrc ? (
                    <div className="w-full space-y-4">
                      {/* Image Preview Window */}
                      <div className="relative rounded-xl overflow-hidden shadow-inner border border-gray-150 max-h-[250px] bg-slate-900 flex items-center justify-center">
                        <canvas
                          ref={canvasRef}
                          className={`w-full h-auto object-contain max-h-[250px] ${activeTab === "original" ? "block" : "hidden"}`}
                        />
                        <canvas
                          ref={edgeCanvasRef}
                          className={`w-full h-auto object-contain max-h-[250px] bg-slate-950 ${activeTab === "edges" ? "block" : "hidden"}`}
                        />
                        
                        {/* Tab Switch Overlay */}
                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm rounded-lg p-0.5 flex border border-white/10 z-10">
                          <button
                            onClick={(e) => { e.stopPropagation(); setActiveTab("original"); }}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors ${
                              activeTab === "original" ? "bg-primary text-white" : "text-gray-300 hover:text-white"
                            }`}
                          >
                            Original
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setActiveTab("edges"); }}
                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors flex items-center gap-1 ${
                              activeTab === "edges" ? "bg-emerald-600 text-white" : "text-gray-300 hover:text-white"
                            }`}
                          >
                            <FaEye size={10} /> Edges
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
                        <span className="truncate max-w-[200px]" title={fileName}>
                          {fileName}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleUploadClick(); }}
                            className="text-primary hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <FaSync size={11} /> Replace
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); resetAll(); }}
                            className="text-red-500 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-3">
                      <div className="mx-auto w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                        <FaCloudUploadAlt size={30} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-700">Drag & drop your ID image here</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, or WebP up to 10MB</p>
                      </div>
                      <Button
                        type="button"
                        onClick={handleUploadClick}
                        className="py-5 px-6 text-xs font-bold bg-primary hover:bg-brand-dark rounded-xl cursor-pointer"
                      >
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>

                {/* Preset Testing Options */}
                <div className="border-t border-gray-100 pt-5 space-y-3">
                  <h4 className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                    <FaFileImage className="text-primary" /> Try Demo ID Mockups
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => generateDemoImage(false)}
                      className="py-3 px-4 border border-emerald-200 hover:border-emerald-400 bg-emerald-50/20 hover:bg-emerald-50/40 text-emerald-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FaCheckCircle className="text-emerald-600" />
                      Try Sharp Demo
                    </button>
                    <button
                      onClick={() => generateDemoImage(true)}
                      className="py-3 px-4 border border-rose-200 hover:border-rose-400 bg-rose-50/20 hover:bg-rose-50/40 text-rose-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FaTimesCircle className="text-rose-600" />
                      Try Blurry Demo
                    </button>
                  </div>
                </div>

                {/* Calibration Sensitivity Slider */}
                <div className="border-t border-gray-100 pt-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                      <FaSlidersH className="text-primary" /> Sharpness Threshold
                    </label>
                    <span className="text-xs font-extrabold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                      {threshold}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <p className="text-[10px] text-gray-400 leading-normal flex items-start gap-1">
                    <FaInfoCircle className="text-gray-400 shrink-0 mt-0.5" />
                    Adjust the threshold limit. Recommended default value is 65. Lowering threshold is more lenient, increasing is stricter.
                  </p>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* RIGHT PANEL: LIVE EVALUATION STATS */}
          <div className="lg:col-span-6">
            <Card className="rounded-2xl border border-gray-150 shadow-sm bg-white overflow-hidden h-full">
              <CardHeader className="bg-slate-900 text-white p-5 border-b border-slate-800">
                <CardTitle className="font-bold text-lg">Analysis & Results</CardTitle>
                <CardDescription className="text-slate-400 text-[11px] mt-0.5">
                  Biometric convolution diagnostics.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 flex flex-col justify-center h-[calc(100%-72px)]">
                {analyzing ? (
                  <div className="text-center py-16 flex flex-col items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
                    <p className="text-sm font-bold text-gray-700">Convolving image pixels...</p>
                    <p className="text-xs text-gray-400 mt-1">Performing grayscale mapping & Laplacian derivatives.</p>
                  </div>
                ) : result ? (
                  <div className="space-y-6">
                    
                    {/* Big Result Banner */}
                    <div className="p-6 rounded-2xl flex flex-col items-center text-center justify-center">
                      {result.isBlurry ? (
                        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 w-full flex flex-col items-center">
                          <FaTimesCircle className="text-rose-600 mb-3" size={48} />
                          <h3 className="text-lg font-extrabold text-rose-800">ID Image Rejected</h3>
                          <span className="inline-block mt-1 px-3 py-1 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                            Blurry Detected
                          </span>
                          <p className="text-xs text-rose-650 mt-3 max-w-sm leading-relaxed">
                            The details on this document are too soft or out of focus. Please ensure the card text is readable and scan again in better lighting.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 w-full flex flex-col items-center">
                          <FaCheckCircle className="text-emerald-600 mb-3" size={48} />
                          <h3 className="text-lg font-extrabold text-emerald-800">ID Image Accepted</h3>
                          <span className="inline-block mt-1 px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                            High Sharpness
                          </span>
                          <p className="text-xs text-emerald-650 mt-3 max-w-sm leading-relaxed">
                            The card details are sharp and legible. High-frequency textual features were successfully extracted.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Numeric breakdown indicators */}
                    <div className="space-y-4 bg-gray-50 border border-gray-100 p-5 rounded-2xl">
                      <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wide">
                        Convolution Diagnostics
                      </h4>

                      {/* Variance score */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-gray-550">Calculated Sharpness Score</span>
                          <span className={result.isBlurry ? "text-rose-600" : "text-emerald-600"}>
                            {formatScore(result.variance)} Variance
                          </span>
                        </div>
                        <Progress
                          value={result.score}
                          className="h-2.5"
                          style={{
                            "--progress-indicator-bg": result.isBlurry ? "#f43f5e" : "#10b981",
                          }}
                        />
                      </div>

                      {/* Threshold compare */}
                      <div className="flex justify-between items-center text-xs border-t border-gray-200/60 pt-3">
                        <span className="text-gray-500 font-semibold">Configured Threshold</span>
                        <span className="font-extrabold text-gray-800">{threshold}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500 font-semibold">Evaluation Status</span>
                        <span className={`font-extrabold flex items-center gap-1 ${result.isBlurry ? "text-rose-600" : "text-emerald-600"}`}>
                          {result.isBlurry ? (
                            <>
                              <FaExclamationTriangle size={11} /> Below Limit
                            </>
                          ) : (
                            <>
                              <FaCheckCircle size={11} /> Validation Passed
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Actions button */}
                    <Button
                      onClick={resetAll}
                      className="w-full py-6 text-sm font-bold bg-primary hover:bg-brand-dark rounded-xl shadow-md cursor-pointer select-none"
                    >
                      Scan Another Image
                    </Button>

                  </div>
                ) : (
                  <div className="text-center py-20 flex flex-col items-center justify-center text-gray-400">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <FaInfoCircle size={28} className="text-gray-300" />
                    </div>
                    <h5 className="font-bold text-sm text-gray-700">Waiting for Document</h5>
                    <p className="text-xs text-gray-400 max-w-xs mt-1.5 leading-normal">
                      Please upload an image or click one of the mock demo cards on the left panel to begin analysis.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>

      </div>
    </div>
  );
}
