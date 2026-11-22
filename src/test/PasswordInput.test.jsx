import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PasswordInput } from "../components/ui/index.jsx";

describe("PasswordInput", () => {
  it("shows and hides the controlled password without changing its value", async () => {
    const user = userEvent.setup();
    render(
      <PasswordInput
        aria-label="Password"
        value="staging-secret"
        onChange={() => {}}
      />,
    );

    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveValue("staging-secret");

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveValue("staging-secret");
  });
});
