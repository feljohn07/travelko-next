"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FaUser, FaIdCard, FaEye } from "react-icons/fa";
import { toast } from "react-toastify";

export default function ProfilePage() {
  const { token, updateProfilePicture, updateUser } = useAuth();

  const [newPassword, setNewPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [idPictures, setIdPictures] = useState([]);
  const [idPicturesPreview, setIdPicturesPreview] = useState([]);
  const [previewModalImage, setPreviewModalImage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    bankName: "",
    bankAccountName: "",
    bankAccountNumber: "",
    gcashNumber: "",
    gender: "",
    profileImageUrl: "",
    idImageUrl: [],
  });

  const [originalProfile, setOriginalProfile] = useState(null);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0] || null;
    setProfilePicture(file);
    if (file) {
      setProfilePicturePreview(URL.createObjectURL(file));
    } else {
      setProfilePicturePreview(null);
    }
  };

  const handleIdPicturesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setIdPictures(files);
    if (files.length > 0) {
      setIdPicturesPreview(files.map((file) => URL.createObjectURL(file)));
    } else {
      setIdPicturesPreview([]);
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/coordinator");
      const data = res.data;

      if (data) {
        // Sync profile image globally with context
        if (data.profileImageUrl) {
          updateProfilePicture(data.profileImageUrl);
        }
        if (updateUser) {
          updateUser(data);
        }
      }

      // Bug #6 Fixed: dynamically check nested objects paymentDetails/payment/flat to load bank details correctly
      const paymentSource = data.paymentDetails || data.payment || data || {};

      const rawIdImages =
        data.idImageUrl ||
        data.idImageUrls ||
        data.idPictures ||
        data.id_image_url ||
        [];
      const normalizedIdImages = Array.isArray(rawIdImages)
        ? rawIdImages.filter(Boolean)
        : typeof rawIdImages === "string" && rawIdImages.trim()
        ? [rawIdImages.trim()]
        : [];

      const loadedProfile = {
        fullName: data.fullName || "",
        email: data.email || "",
        phoneNumber: data.phoneNumber || "",
        address: data.address || "",
        bankName: paymentSource.bankName || "",
        bankAccountName: paymentSource.bankAccountName || paymentSource.accountName || "",
        bankAccountNumber: paymentSource.bankAccountNumber || paymentSource.accountNumber || "",
        gcashNumber: paymentSource.gcashNumber || "",
        gender: data.gender || "",
        profileImageUrl: data.profileImageUrl || "",
        idImageUrl: normalizedIdImages,
      };

      setProfile(loadedProfile);
      setOriginalProfile(loadedProfile);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      const timer = setTimeout(() => {
        fetchProfile();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [token]);

  const onChange = (key) => (e) => {
    setProfile((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const startEdit = () => {
    setIsEditing(true);
    toast.info("Edit mode enabled");
  };

  const cancelEdit = () => {
    if (originalProfile) setProfile(originalProfile);
    setIsEditing(false);
    setNewPassword("");
    setProfilePicture(null);
    setProfilePicturePreview(null);
    setIdPictures([]);
    setIdPicturesPreview([]);
    toast.info("Changes discarded");
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    const toastId = toast.loading("Saving profile settings...");
    try {
      const fd = new FormData();
      fd.append("fullName", profile.fullName);
      fd.append("email", profile.email);
      fd.append("phoneNumber", profile.phoneNumber);
      fd.append("address", profile.address);
      fd.append("gender", profile.gender);

      // Append bank details
      fd.append("bankName", profile.bankName);
      fd.append("bankAccountName", profile.bankAccountName);
      fd.append("bankAccountNumber", profile.bankAccountNumber);
      fd.append("gcashNumber", profile.gcashNumber);

      if (newPassword.trim()) {
        fd.append("newPassword", newPassword);
      }
      if (profilePicture) {
        fd.append("profilePicture", profilePicture);
      }
      if (idPictures.length > 0) {
        idPictures.forEach((file) => fd.append("idPictures", file));
      }

      const res = await api.put("/auth/coordinator", fd);

      // Update local storage and context picture if changed
      if (res.data?.profileImageUrl) {
        updateProfilePicture(res.data.profileImageUrl);
      }
      if (updateUser) {
        updateUser({ fullName: profile.fullName, email: profile.email, phoneNumber: profile.phoneNumber, address: profile.address });
      }

      await fetchProfile();

      setIsEditing(false);
      setNewPassword("");
      setProfilePicture(null);
      setProfilePicturePreview(null);
      setIdPictures([]);
      setIdPicturesPreview([]);

      toast.update(toastId, {
        render: "✅ Profile updated successfully",
        type: "success",
        isLoading: false,
        autoClose: 2500,
      });
    } catch (err) {
      console.error(err);
      toast.update(toastId, {
        render: `❌ ${err.response?.data?.message || "Failed to update profile"}`,
        type: "error",
        isLoading: false,
        autoClose: 3500,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-150">
        <div className="flex items-center gap-3.5">
          <div className="relative h-14 w-14 shrink-0 rounded-full aspect-square overflow-hidden border border-gray-200 shadow-sm bg-gray-100 flex items-center justify-center">
            {profile.profileImageUrl ? (
              <img
                src={profile.profileImageUrl}
                alt={profile.fullName || "Coordinator"}
                className="h-full w-full object-cover"
              />
            ) : (
              <FaUser className="h-6 w-6 text-gray-300" />
            )}
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              {profile.fullName || "Profile Settings"}
            </h2>
            <p className="text-gray-400 text-xs mt-0.5">
              {profile.email || "Manage coordinator and banking credentials"}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          {!isEditing ? (
            <Button
              onClick={startEdit}
              className="px-5 py-2.5 text-xs font-bold bg-primary hover:bg-brand-dark rounded-full cursor-pointer shadow-sm select-none"
            >
              ✏️ Edit Profile
            </Button>
          ) : (
            <Button
              onClick={cancelEdit}
              variant="outline"
              className="px-5 py-2.5 text-xs font-bold rounded-full select-none"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={saveProfile} className="space-y-6 text-sm">
        {/* Basic profile details */}
        <Card className="rounded-2xl border-gray-100 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <h5 className="font-bold text-gray-900 text-base mb-2">Profile Information</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={onChange("fullName")}
                  disabled={!isEditing}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={onChange("email")}
                  disabled={!isEditing}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={profile.phoneNumber}
                  onChange={onChange("phoneNumber")}
                  disabled={!isEditing}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Gender</label>
                <select
                  value={profile.gender}
                  onChange={onChange("gender")}
                  disabled={!isEditing}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary text-gray-700 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Address</label>
                <input
                  type="text"
                  value={profile.address}
                  onChange={onChange("address")}
                  disabled={!isEditing}
                  placeholder="City, Province, Philippines"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banking and GCash */}
        <Card className="rounded-2xl border-gray-100 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <h5 className="font-bold text-gray-900 text-base mb-2">Payment & Banking Information</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={profile.bankName}
                  onChange={onChange("bankName")}
                  disabled={!isEditing}
                  placeholder="E.g. BDO, BPI, Metrobank"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Account Name</label>
                <input
                  type="text"
                  value={profile.bankAccountName}
                  onChange={onChange("bankAccountName")}
                  disabled={!isEditing}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Bank Account Number</label>
                <input
                  type="text"
                  value={profile.bankAccountNumber}
                  onChange={onChange("bankAccountNumber")}
                  disabled={!isEditing}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">GCash Number</label>
                <input
                  type="text"
                  value={profile.gcashNumber}
                  onChange={onChange("gcashNumber")}
                  disabled={!isEditing}
                  placeholder="0900 000 0000"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Uploads and credentials password updates */}
        <Card className="rounded-2xl border-gray-100 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6 space-y-6">
            <div className="border-b border-gray-100 pb-3">
              <h5 className="font-bold text-gray-900 text-base">Account Settings & Media</h5>
              <p className="text-xs text-gray-400 mt-0.5">
                Review your uploaded documents, profile photo, and security credentials
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Picture Column */}
              <div className="space-y-4 p-4 rounded-xl bg-gray-50/70 border border-gray-150">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Profile Picture
                  </label>
                  {profilePicturePreview ? (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      New Photo Selected
                    </span>
                  ) : profile.profileImageUrl ? (
                    <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                      Active on File
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      Not Uploaded
                    </span>
                  )}
                </div>

                {/* Display Current or Selected Profile Picture */}
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 shrink-0 rounded-full aspect-square overflow-hidden border-2 border-white shadow-sm ring-2 ring-gray-150 bg-gray-100 flex items-center justify-center">
                    {profilePicturePreview ? (
                      <img
                        src={profilePicturePreview}
                        alt="New Profile Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : profile.profileImageUrl ? (
                      <img
                        src={profile.profileImageUrl}
                        alt="Current Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FaUser className="h-8 w-8 text-gray-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">
                      {profilePicturePreview
                        ? "Preview of your new photo"
                        : profile.profileImageUrl
                        ? "Currently uploaded profile photo"
                        : "No profile photo uploaded yet"}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      JPG, PNG or WEBP (Max 5MB)
                    </p>
                    {profile.profileImageUrl && !profilePicturePreview && (
                      <button
                        type="button"
                        onClick={() => setPreviewModalImage(profile.profileImageUrl)}
                        className="mt-1.5 text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <FaEye size={11} /> View full photo
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    {isEditing ? "Choose New Profile Picture" : "Change Profile Picture (Enable edit mode)"}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={!isEditing}
                    onChange={handleProfilePictureChange}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Password Column */}
              <div className="space-y-4 p-4 rounded-xl bg-gray-50/70 border border-gray-150 flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Security & Password
                  </label>
                  <p className="text-xs text-gray-400 mb-4">
                    Leave blank if you do not wish to change your password.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter new password"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Valid ID Section */}
            <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-150 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Valid Identification Documents
                  </label>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Government-issued ID submitted during registration or profile update
                  </p>
                </div>
                {idPicturesPreview.length > 0 ? (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    {idPicturesPreview.length} New ID(s) Selected
                  </span>
                ) : profile.idImageUrl && profile.idImageUrl.length > 0 ? (
                  <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    {profile.idImageUrl.length} Verified Document(s) on File
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    No ID on File
                  </span>
                )}
              </div>

              {/* Display Images */}
              {idPicturesPreview.length > 0 ? (
                <div>
                  <p className="text-[11px] font-semibold text-amber-700 mb-2">
                    Pending replacement uploads (will save when you click &quot;Save Changes&quot;):
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {idPicturesPreview.map((url, idx) => (
                      <div
                        key={idx}
                        className="group relative rounded-xl border border-amber-200 overflow-hidden bg-white shadow-sm"
                      >
                        <img
                          src={url}
                          alt={`New ID Preview ${idx + 1}`}
                          className="w-full h-28 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPreviewModalImage(url)}
                        />
                        <div className="p-1.5 text-center bg-amber-50/80 border-t border-amber-100">
                          <span className="text-[10px] text-amber-800 font-medium">New ID #{idx + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : profile.idImageUrl && profile.idImageUrl.length > 0 ? (
                <div>
                  <p className="text-[11px] font-semibold text-gray-600 mb-2">
                    Current Valid ID on file (Click to inspect full size):
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {profile.idImageUrl.map((url, idx) => (
                      <div
                        key={idx}
                        onClick={() => setPreviewModalImage(url)}
                        className="group relative rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm cursor-pointer hover:border-primary transition-all hover:shadow-md"
                      >
                        <img
                          src={url}
                          alt={`Valid ID Document ${idx + 1}`}
                          className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-xs font-semibold">
                          <FaEye size={12} /> View Full
                        </div>
                        <div className="p-1.5 text-center bg-gray-50 border-t border-gray-100">
                          <span className="text-[10px] text-gray-600 font-medium">Document #{idx + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-6 flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-xl bg-white text-center">
                  <FaIdCard className="text-gray-300 h-8 w-8 mb-1.5" />
                  <p className="text-xs text-gray-500 font-medium">No valid ID currently on file</p>
                  <p className="text-[11px] text-gray-400">Click &quot;Edit Profile&quot; to upload your government ID</p>
                </div>
              )}

              <div className="pt-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                  {isEditing ? "Upload / Replace Valid ID (up to 5 images)" : "Update Valid ID (Enable edit mode to upload)"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={!isEditing}
                  onChange={handleIdPicturesChange}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-4 border-t border-gray-50 mt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-primary hover:bg-brand-dark text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer shadow-sm select-none"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelEdit}
                  className="px-6 py-2.5 text-xs font-bold rounded-xl select-none"
                >
                  Discard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </form>

      {/* Attachment Preview Modal */}
      <Dialog open={!!previewModalImage} onOpenChange={() => setPreviewModalImage(null)}>
        <DialogContent className="max-w-3xl p-3 bg-white">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-gray-800">
              Document Preview
            </DialogTitle>
          </DialogHeader>
          {previewModalImage && (
            <div className="p-2 flex flex-col items-center justify-center bg-gray-50 rounded-xl overflow-hidden">
              <img
                src={previewModalImage}
                alt="Document Attachment Full View"
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-sm"
              />
              <div className="mt-3 flex justify-between w-full px-2 text-xs">
                <a
                  href={previewModalImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-bold flex items-center gap-1"
                >
                  Open Original Image in New Tab ↗
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
