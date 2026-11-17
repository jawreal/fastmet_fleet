"use client";
import { useState, type SubmitEvent } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordSettings() {
  const [showPasswords, setShowPasswords] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  /*TAKE_NOTE: MOCK UP */
  function changePassword(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const current = data.get("currentPassword");
    const next = data.get("newPassword");
    const confirm = data.get("confirmPassword");
    if (
      typeof current !== "string" ||
      typeof next !== "string" ||
      typeof confirm !== "string"
    )
      return;
    if (!/[A-Z]/.test(next) || !/[a-z]/.test(next) || !/\d/.test(next)) {
      setError("Use uppercase and lowercase letters and a number.");
      return;
    }
    if (next !== confirm) {
      setError("New passwords do not match.");
      return;
    }
    if (current === next) {
      setError("Choose a password different from your current password.");
      return;
    }
    form.reset();
    setNotice(
      "Preview validated. Your password has not changed; account authentication is not connected.",
    );
  }
  return (
    <Card className="@container min-w-0" aria-labelledby="password-heading">
      <CardHeader>
        <CardTitle id="password-heading">Password</CardTitle>
        <CardDescription>
          Change the password used to sign in to your company account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={changePassword} className="flex flex-1 flex-col gap-4">
        <CardContent className="grid grid-cols-1 gap-5 @lg:grid-cols-2">
          <div className="grid gap-4">
            {[
              {
                id: "currentPassword",
                label: "Current password",
                autoComplete: "current-password",
              },
              {
                id: "newPassword",
                label: "New password",
                autoComplete: "new-password",
              },
              {
                id: "confirmPassword",
                label: "Confirm new password",
                autoComplete: "new-password",
              },
            ].map((field) => (
              <div key={field.id} className="grid gap-2">
                <Label htmlFor={field.id}>{field.label}</Label>
                <Input
                  id={field.id}
                  name={field.id}
                  type={showPasswords ? "text" : "password"}
                  autoComplete={field.autoComplete}
                  required
                  minLength={field.id === "currentPassword" ? undefined : 12}
                  placeholder={
                    field.label === "New password"
                      ? "At least 12 characters"
                      : field.label
                  }
                />
              </div>
            ))}
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={showPasswords}
                onChange={(event) => setShowPasswords(event.target.checked)}
                className="accent-primary"
              />{" "}
              Show passwords
            </label>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-medium">Requirements</h3>
            <ul className="list-disc space-y-2 pl-4 text-xs/relaxed text-muted-foreground">
              <li>At least 12 characters</li>
              <li>Uppercase and lowercase letters and a number</li>
              <li>Both new passwords match</li>
            </ul>
          </div>
          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
          {notice && <p className="text-xs text-muted-foreground">{notice}</p>}
        </CardContent>
        <CardFooter className="mt-auto justify-end border-t">
          <Button type="submit" size="lg">
            Update password
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
