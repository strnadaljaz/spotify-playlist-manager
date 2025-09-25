import "@testing-library/jest-dom";
import { render, waitFor } from "@testing-library/react";
import React from "react";
import Dashboard from "../../app/dashboard/page";
import { useSpotify } from "../../app/hooks/useSpotify";
import "whatwg-fetch";

jest.mock("../../app/hooks/useSpotify");
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("Dashboard", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    // Reset fetch to default
  // No need to set global.fetch to undefined; just clear mocks.
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Redirects to '/' if localStorage lacks user_id", async () => {
  (useSpotify as jest.Mock).mockImplementation(() => ({
      playlistsData: null,
      setPlaylistsData: jest.fn(),
      userInfo: null,
      setUserInfo: jest.fn(),
      token: null,
      setToken: jest.fn(),
    }));
    render(<Dashboard />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  test("Redirects to '/' if token or playlist fetch fails", async () => {
  (useSpotify as jest.Mock).mockImplementation(() => ({
      playlistsData: null,
      setPlaylistsData: jest.fn(),
      userInfo: null,
      setUserInfo: jest.fn(),
      token: null,
      setToken: jest.fn(),
    }));
    localStorage.setItem("user_id", "test_id");
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: false });
    render(<Dashboard />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  test("Redirects to '/' and removes token if Spotify user info fetch fails", async () => {
  (useSpotify as jest.Mock).mockImplementation(() => ({
      playlistsData: [],
      setPlaylistsData: jest.fn(),
      userInfo: null,
      setUserInfo: jest.fn(),
      token: "fake_token",
      setToken: jest.fn(),
    }));
    localStorage.setItem("user_id", "test_id");
    localStorage.setItem("spotify_access_token", "fake_token");
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: "fake_token" }) }) // token
      .mockResolvedValueOnce({ ok: true, json: async () => ({ playlists_data: { items: [] } }) }) // playlists
      .mockResolvedValueOnce({ ok: false }); // user info
    render(<Dashboard />);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
    expect(localStorage.getItem("spotify_access_token")).toBeNull();
  });
});