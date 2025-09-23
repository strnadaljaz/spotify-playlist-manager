import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import React from "react";
import Callback from "../../app/callback/page";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    query: { code: "AUTH_CODE", error: undefined },
  }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === "code") return "AUTH_CODE";
      if (key === "error") return undefined;
      return null;
    },
  }),
}));

test("The component correctly reads the authorization code (and/or error) from the URL query parameters", () => {
  render(<Callback />);
  // Replace with actual UI logic, e.g.:
  expect(screen.getByText(/An error occurred during authentication/)).toBeInTheDocument();
});