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

test("It handles fetch success and failure (e.g., displays a message or redirects)", async () => {
  // Success case
  const fetchMock = jest.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({ access_token: "ACCESS_TOKEN" }),
  } as Response);

  render(<Callback />);
  expect(await screen.findByText(/Spotify Authentication/)).toBeInTheDocument();
  // You may want to check for a success message or redirect logic here

  fetchMock.mockRestore();

  // Failure case
  const fetchMockFail = jest.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: false,
    status: 400,
    statusText: "Bad Request",
    json: async () => ({}),
  } as Response);

  render(<Callback />);
  expect(await screen.findByText(/Authentication successful! Redirecting.../)).toBeInTheDocument();

  fetchMockFail.mockRestore();
});