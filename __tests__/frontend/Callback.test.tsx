import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import React from "react";
import Callback from "../../app/callback/page";
import { useRouter } from "next/navigation";
import "whatwg-fetch";

// Default mock for most tests
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    query: { code: "AUTH_CODE", error: undefined },
    // Add a dummy push so destructuring doesn't break
    push: jest.fn(),
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

test("Shows a loading indicator while waiting for the backend", async () => {
  // Simulate a slow fetch response
  const fetchMock = jest.spyOn(globalThis, "fetch").mockImplementation(() =>
    new Promise(resolve =>
      setTimeout(() => resolve({
        ok: true,
        json: async () => ({ access_token: "ACCESS_TOKEN" }),
      } as Response), 100)
    )
  );

  render(<Callback />);
  // The loading indicator should be visible while waiting
  expect(screen.getByText(/Processing.../)).toBeInTheDocument();

  // Wait for fetch to resolve and UI to update
  await screen.findByText(/Spotify Authentication/);

  fetchMock.mockRestore();
});

test("Displays an error message if something goes wrong", async () => {
  const fetchMock = jest.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));

  render(<Callback />);
  expect(await screen.findByText(/An error occurred during authentication/)).toBeInTheDocument();

  fetchMock.mockRestore();
});

test("Redirects or updates UI on success", async () => {
  // Mock fetch to simulate successful token exchange
  const fetchMock = jest.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({
      access_token: "ACCESS_TOKEN",
      spotify_id: "SPOTIFY_USER_ID"
    }),
  } as Response);

  // Mock router.push to observe redirection
  const pushMock = jest.fn();
  jest.spyOn(require("next/navigation"), "useRouter").mockReturnValue({
    query: { code: "AUTH_CODE", error: undefined },
    push: pushMock,
  });

  render(<Callback />);
  
  // Wait for success message
  expect(await screen.findByText(/Authentication successful! Redirecting.../)).toBeInTheDocument();

  // Wait for the redirect to be triggered (after 2s)
  await new Promise(resolve => setTimeout(resolve, 2100));
  expect(pushMock).toHaveBeenCalledWith("/dashboard");

  fetchMock.mockRestore();
});

test("Displays an error if no authorization code is present", async () => {
  // Override useSearchParams to simulate missing code
  jest.spyOn(require("next/navigation"), "useSearchParams").mockReturnValue({
    get: (key: string) => {
      if (key === "code") return null;
      if (key === "error") return undefined;
      return null;
    },
  });

  render(<Callback />);
  expect(await screen.findByText(/No authorization code received/)).toBeInTheDocument();
});

test("Displays an error if the backend returns an error", async () => {
  // Ensure useSearchParams returns a valid code
  jest.spyOn(require("next/navigation"), "useSearchParams").mockReturnValue({
    get: (key: string) => {
      if (key === "code") return "AUTH_CODE";
      if (key === "error") return undefined;
      return null;
    },
  });

  // Mock fetch to simulate backend error response
  const fetchMock = jest.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({
      error: "Invalid code",
    }),
  } as Response);

  render(<Callback />);
  expect(await screen.findByText(/Error: Invalid code/)).toBeInTheDocument();

  fetchMock.mockRestore();
});