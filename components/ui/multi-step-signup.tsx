import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
};

const steps = [
  { id: 1, title: "Your details" },
  { id: 2, title: "Contact info" },
  { id: 3, title: "Security" },
];

export function MultiStepSignUp({ onSubmit, isSubmitting }: MultiStepSignUpProps) {
  const [step, setStep] = React.useState(1);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const totalSteps = steps.length;

  const handleNext = () => {
    setError(null);
    if (step === 1 && (!name.trim() || !email.trim())) {
      setError("Please fill in your name and email to continue.");
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
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (onSubmit) {
      await onSubmit({
        name,
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
      <div>
        <div className="flex items-center justify-between text-xs font-medium text-gray-500 mb-2">
          <span>
            Step {step} of {totalSteps}
          </span>
          <span>{steps[step - 1]?.title}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

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
              <div>
                <Label htmlFor="ms-name">Full name</Label>
                <Input
                  id="ms-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  disabled={isSubmitting}
                  required
                />
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
                <Input
                  id="ms-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters
                </p>
              </div>
              <div>
                <Label htmlFor="ms-confirm-password">Confirm password</Label>
                <Input
                  id="ms-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  required
                />
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
    </div>
  );
}


