import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Check } from "lucide-react";

type MultiStepSignUpProps = {
  onSubmit?: (values: {
    name: string;
    email: string;
    address: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }) => void | Promise<void>;
  isSubmitting?: boolean;
  onBack?: () => void;
};

const steps = [
  { id: 1, title: "Details" },
  { id: 2, title: "Contact" },
  { id: 3, title: "Security" },
];

export function MultiStepSignUp({ onSubmit, isSubmitting, onBack }: MultiStepSignUpProps) {
  const [step, setStep] = React.useState(1);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const totalSteps = steps.length;

  const handleNext = () => {
    setError(null);
    if (step === 1 && (!firstName.trim() || !lastName.trim() || !email.trim())) {
      setError("Please fill in your first name, last name, and email to continue.");
      return;
    }
    if (step === 2 && (!address.trim() || !phone.trim())) {
      setError("Please provide your address and phone number.");
      return;
    }
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setError(null);
    if (step === 1) {
      if (onBack) onBack();
    } else {
      setStep((prev) => Math.max(prev - 1, 1));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Password Validation Logic
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // Personal Info Check
    const lowerPwd = password.toLowerCase();
    const parts = [
      firstName.toLowerCase(),
      lastName.toLowerCase(),
      email.split('@')[0].toLowerCase(),
      phone.replace(/\D/g, '')
    ].filter(p => p.length > 3);
    const hasPersonalInfo = parts.some(part => lowerPwd.includes(part));

    // Common Patterns
    const commonPatterns = ["password", "123456", "qwerty", "admin"];
    const hasCommonPattern = commonPatterns.some(p => lowerPwd.includes(p));

    if (!hasLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return;
    }

    if (hasPersonalInfo || hasCommonPattern) {
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (onSubmit) {
      await onSubmit({
        name: `${firstName} ${lastName}`.trim(),
        email,
        address,
        phone,
        password,
        confirmPassword,
      });
    }
  };

  const progress = (step / totalSteps) * 100;

  return (
    <div className="space-y-6">
      <div className="w-full max-w-xs mx-auto mb-8">
        <div className="flex items-center justify-between relative">
          {steps.map((s, i) => {
            const isLast = i === steps.length - 1;
            const isCompleted = step > s.id;
            const isFilled = step >= s.id;
            const isCurrent = step === s.id;

            return (
              <React.Fragment key={s.id}>
                {/* Step Circle */}
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className={`
                      relative flex h-8 w-8 items-center justify-center rounded-full border-2 overflow-hidden transition-colors duration-300
                      ${isFilled ? "border-brand-blue" : "border-gray-200 bg-white"}
                    `}
                  >
                    {/* Water Fill (Horizontal) */}
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-brand-blue"
                      initial={{ width: "0%" }}
                      animate={{ width: isFilled ? "100%" : "0%" }}
                      transition={{
                        duration: 0.5,
                        ease: "easeInOut",
                        delay: isFilled ? (s.id === 1 ? 0 : 0.5) : 0, // Fill: wait for bar. Unfill: immediate.
                      }}
                    />

                    {/* Content */}
                    <div className={`relative z-10 text-xs font-semibold transition-colors duration-300 ${isFilled ? "text-white" : "text-gray-400"}`}>
                      {isCompleted ? <Check className="h-4 w-4" /> : s.id}
                    </div>
                  </div>

                  {/* Title */}
                  <span
                    className={`
                      absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium whitespace-nowrap transition-colors duration-300
                      ${isFilled ? "text-brand-blue" : "text-gray-400"}
                    `}
                  >
                    {s.title}
                  </span>
                </div>

                {/* Connecting Bar (Horizontal) */}
                {!isLast && (
                  <div className="flex-1 h-1 bg-gray-200 relative -mx-1">
                    <motion.div
                      className="h-full bg-brand-blue"
                      initial={{ width: "0%" }}
                      animate={{ width: step > s.id ? "100%" : "0%" }}
                      transition={{
                        duration: 0.5,
                        ease: "easeInOut",
                        delay: step > s.id ? 0 : 0.5, // Fill: immediate. Unfill: wait for step.
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )
      }

      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-5"
            >
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="ms-firstname">First name</Label>
                  <Input
                    id="ms-firstname"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="ms-lastname">Last name</Label>
                  <Input
                    id="ms-lastname"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="ms-email">Email address</Label>
                <Input
                  id="ms-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-5"
            >
              <div>
                <Label htmlFor="ms-address">Address</Label>
                <Input
                  id="ms-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, City, Country"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="ms-phone">Phone Number</Label>
                <Input
                  id="ms-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                  disabled={isSubmitting}
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-5"
            >
              <div>
                <Label htmlFor="ms-password">Password</Label>
                <div className="relative">
                  <Input
                    id="ms-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Password Conditions */}
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-gray-500 font-medium">Password requirements:</p>
                  <ul className="space-y-1">
                    {[
                      { label: "At least 8 characters", valid: password.length >= 8 },
                      { label: "Uppercase & lowercase letters", valid: /[A-Z]/.test(password) && /[a-z]/.test(password) },
                      { label: "Number & special character", valid: /[0-9]/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password) },
                      {
                        label: "No personal info or common patterns",
                        valid: (() => {
                          const lowerPwd = password.toLowerCase();
                          const parts = [
                            firstName.toLowerCase(),
                            lastName.toLowerCase(),
                            email.split('@')[0].toLowerCase(),
                            phone.replace(/\D/g, '')
                          ].filter(p => p.length > 3);

                          const hasmessageInfo = parts.some(part => lowerPwd.includes(part));
                          const commonPatterns = ["password", "123456", "qwerty", "admin"];
                          const hasCommonPattern = commonPatterns.some(p => lowerPwd.includes(p));

                          return !hasmessageInfo && !hasCommonPattern;
                        })()
                      }
                    ].map((req, idx) => (
                      <li key={idx} className={`text-xs flex items-center gap-2 ${req.valid ? "text-green-600" : "text-gray-400"}`}>
                        {req.valid ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <div className="h-3 w-3 rounded-full border border-gray-300" />
                        )}
                        {req.label}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="ms-confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="ms-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={isSubmitting}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBack}
            disabled={isSubmitting}
          >
            Back
          </Button>
          {step < totalSteps ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          )}
        </div>
      </form>
    </div >
  );
}
