import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import React from "react";
import Callback from "../../app/callback/page";
import { useRouter } from "next/navigation";
import "whatwg-fetch";

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
  expect(screen.getByText(/Processing.../)).toBeInTheDocument();
});

test("On mount, it sends the code to your backend to exchange for tokens", async () => {
  const fetchMock = jest.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({ access_token: "ACCESS_TOKEN" }),
  } as Response);

  render(<Callback />);

  await screen.findByText(/Spotify Authentication/); // Wait for component to render

  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining("/callback"),
    expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({
        "Content-Type": "application/json",
      }),
      body: expect.stringContaining("AUTH_CODE"),
    })
  );

  fetchMock.mockRestore();
});