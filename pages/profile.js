import Head from "next/head";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { User, Mail, Phone, MapPin, Edit, Save, X } from "lucide-react";
import Navbar from "../components/Navbar";
import LocationAndAlertsSettings from "../components/LocationAndAlertsSettings";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const user = session?.user || {};
  const displayName = user.name || "User";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleEditClick = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
    });
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/user/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: formData.phone,
          address: formData.address,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Update session to reflect changes
      await update({
        ...session,
        user: {
          ...session?.user,
          phone: formData.phone,
          address: formData.address,
        },
      });

      setIsEditMode(false);
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const profileFields = [
    { label: "Name", key: "name", value: user.name, Icon: User, editable: false },
    { label: "Email", key: "email", value: user.email, Icon: Mail, editable: false },
    { label: "Phone", key: "phone", value: user.phone, Icon: Phone, editable: true },
    { label: "Address", key: "address", value: user.address, Icon: MapPin, editable: true },
  ];

  return (
    <div className="min-h-screen bg-white text-[rgb(27,55,121)] font-sans">
      <Head>
        <title>User Profile</title>
        <meta name="description" content="Your profile information" />
      </Head>

      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-16">
        <header className="mb-12 mt-8">
          <h1 className="text-4xl md:text-5xl font-serif tracking-tight border-none">
            Profile
          </h1>
          <p className="text-[rgb(27,55,121)]/70 mt-3">
            View your personal information.
          </p>
          <div className="h-px bg-[rgb(27,55,121)]/15 mt-6" />
        </header>

        {status === "loading" && (
          <div className="text-[rgb(27,55,121)]/70">Loading profile…</div>
        )}

        {status === "unauthenticated" && (
          <div className="space-y-4">
            <p className="text-[rgb(27,55,121)]/80">
              You are not signed in.
            </p>
            <Link
              href="/auth/usertype"
              className="inline-flex items-center justify-center rounded-md bg-[rgb(27,55,121)] px-4 py-2 text-white text-sm font-medium shadow hover:shadow-md transition"
            >
              Go to sign in
            </Link>
          </div>
        )}

        {status === "authenticated" && (
          <section className="space-y-6">
            <div className="space-y-2">
              <div className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-[rgb(27,55,121)]" />
                    <h2 className="text-3xl font-serif font-semibold text-[rgb(27,55,121)]">
                      Personal Details
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditMode && (
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 rounded-md font-semibold border border-[rgb(27,55,121)]/20 text-[rgb(27,55,121)] hover:bg-[rgb(27,55,121)]/5 transition-all text-sm flex items-center justify-center gap-2 whitespace-nowrap duration-200"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={isEditMode ? handleSave : handleEditClick}
                      disabled={isSaving}
                      className="bg-[rgb(27,55,121)] text-white px-4 py-2 rounded-md font-semibold hover:bg-[rgb(27,55,121)]/90 transition-all text-sm flex items-center justify-center gap-3 whitespace-nowrap min-w-[200px] disabled:opacity-50 duration-200"
                    >
                      {isEditMode ? (
                        <>
                          <Save className="w-4 h-4" />
                          {isSaving ? "Saving..." : "Save Changes"}
                        </>
                      ) : (
                        <>
                          Edit Profile
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {profileFields.map(({ label, key, value, Icon, editable }) => (
                <div
                  key={label}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-3 transition-all duration-200"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[rgb(27,55,121)]/70" />
                    <span className="text-base font-semibold uppercase tracking-widest text-[rgb(27,55,121)]/70">
                      {label}
                    </span>
                  </div>
                  {isEditMode && editable ? (
                    <input
                      type="text"
                      value={formData[key]}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      className={`text-lg font-medium text-[rgb(27,55,121)] px-3 py-2 border border-[rgb(27,55,121)]/20 rounded-md focus:ring-2 focus:ring-[rgb(27,55,121)] focus:border-[rgb(27,55,121)] bg-white transition-all duration-200 ${key === "address" ? "w-full sm:w-auto sm:min-w-[500px]" : key === "phone" ? "w-full sm:w-auto sm:min-w-[500px]" : "min-w-[200px]"
                        }`}
                    />
                  ) : (
                    <span className="text-lg font-medium text-[rgb(27,55,121)]">
                      {isEditMode && !editable ? value || "—" : value || "—"}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-[rgb(27,55,121)]/20"></div>

            <div className="space-y-4">
              <LocationAndAlertsSettings />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

