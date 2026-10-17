"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

export default function ProfilePage() {
  const { token, updateProfilePicture, updateUser } = useAuth();

  const [newPassword, setNewPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [idPictures, setIdPictures] = useState([]);

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
  });

  const [originalProfile, setOriginalProfile] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/coordinator");
      const data = res.data;

      if (data) {
        // Sync profile image globally with context
        updateProfilePicture(data.profileImageUrl);
        if (updateUser) {
          updateUser(data);
        }
      }

      // Bug #6 Fixed: dynamically check nested objects paymentDetails/payment/flat to load bank details correctly
      const paymentSource = data.paymentDetails || data.payment || data || {};

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
    setIdPictures([]);
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

      setOriginalProfile(profile);
      setIsEditing(false);
      setNewPassword("");
      setProfilePicture(null);
      setIdPictures([]);

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
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Profile Settings
          </h2>
          <p className="text-gray-400 text-xs mt-0.5">Manage coordinator and banking credentials</p>
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
          <CardContent className="p-6 space-y-4">
            <h5 className="font-bold text-gray-900 text-base mb-2">Account Settings</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Change Profile Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={!isEditing}
                    onChange={(e) => setProfilePicture(e.target.files[0])}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Update Valid ID</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={!isEditing}
                    onChange={(e) => setIdPictures(Array.from(e.target.files))}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Change Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter new password"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
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
    </div>
  );
}
