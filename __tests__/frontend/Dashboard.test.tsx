import "@testing-library/jest-dom";
import { render, waitFor } from "@testing-library/react";
import React from "react";
import Dashboard from "../../app/dashboard/page";
import "whatwg-fetch";

// Mock useRouter from next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe("Dashboard", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test("Redirects to '/' if localStorage lacks spotify_id", () => {
    const mockPush = jest.fn();
    // Override useRouter to use our mock
    jest.spyOn(require("next/navigation"), "useRouter").mockReturnValue({ push: mockPush });

    render(<Dashboard />);
    // Wait for useEffect to run
    setTimeout(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    }, 0);
  });

  test("Redirects to '/' if token or playlist fetch fails", async () => {
    const mockPush = jest.fn();
    jest.spyOn(require("next/navigation"), "useRouter").mockReturnValue({ push: mockPush });

    // Set spotify_id in localStorage
    localStorage.setItem("spotify_id", "test_id");

    // Mock fetch to simulate failed token fetch
    global.fetch = jest.fn()
      // First call: token fetch fails
      .mockResolvedValueOnce({ ok: false })
      // Second call: playlist fetch fails
      .mockResolvedValueOnce({ ok: false });

    render(<Dashboard />);

    // Wait for useEffect to run
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockPush).toHaveBeenCalledWith("/");
  });

  test("Redirects to '/' and removes token if Spotify user info fetch fails", async () => {
    const mockPush = jest.fn();
    jest.spyOn(require("next/navigation"), "useRouter").mockReturnValue({ push: mockPush });

    // Set spotify_id and token in localStorage
    localStorage.setItem("spotify_id", "test_id");
    localStorage.setItem("spotify_access_token", "fake_token");

    // Mock fetch:
    // 1. Token fetch succeeds
    // 2. Playlist fetch succeeds
    // 3. User info fetch fails
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: "fake_token" }) }) // token
      .mockResolvedValueOnce({ ok: true, json: async () => ({ playlists_data: { items: [] } }) }) // playlists
      .mockResolvedValueOnce({ ok: false }); // user info

    render(<Dashboard />);

    // Wait for useEffect to run and redirect
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });

    expect(localStorage.getItem("spotify_access_token")).toBeNull();
  });
});