import "@testing-library/jest-dom";
import { render, waitFor, screen } from "@testing-library/react";
import React from "react";
import Dashboard from "../../app/dashboard/page";
import { useSpotify } from "../../app/hooks/useSpotify";
import "whatwg-fetch";

const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://spotify-playlist-manager-backend-atej.onrender.com";

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

    test("On mount, fetches access token and playlists from backend using spotify_id", async () => {
        (useSpotify as jest.Mock).mockImplementation(() => ({
            playlistsData: null,
            setPlaylistsData: jest.fn(),
            userInfo: null,
            setUserInfo: jest.fn(),
            token: null,
            setToken: jest.fn(),
        }));

        localStorage.setItem("user_id", "test_id");

        const fetchMock = jest.spyOn(globalThis, "fetch").mockResolvedValue({
            ok: true,
            json: async () => ({}),
        } as Response);

        render(<Dashboard/>);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                `${backendUrl}/getAccessToken`,
                expect.objectContaining({
                    method: "POST",
                    headers: expect.objectContaining({
                        "Content-Type": "application/json",
                    }),
                    body: expect.any(String),
                })
            );

            expect(global.fetch).toHaveBeenCalledWith(
                `${backendUrl}/getPlaylistsData`,
                expect.objectContaining({
                    method: "POST",
                    headers: expect.objectContaining({
                        "Content-Type": "application/json",
                    }),
                    body: expect.any(String),
                })
            );
        });
        fetchMock.mockRestore();
    });

    test("Fetches Spotify user info using the access token", async () => {
        const fakeToken = "test_token";

        (useSpotify as jest.Mock).mockImplementation(() => ({
            playlistsData: [],
            setPlaylistsData: jest.fn(),
            userInfo: null,
            setUserInfo: jest.fn(),
            token: fakeToken,
            setToken: jest.fn(),
        }));

        const fetchMock = jest.spyOn(globalThis, "fetch").mockResolvedValue({
            ok: true,
            json: async () => ({}),
        } as Response);

        render(<Dashboard />);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                "https://api.spotify.com/v1/me",
                expect.objectContaining({
                    headers: expect.objectContaining({
                        "Authorization": `Bearer ${fakeToken}`
                    }),
                })
            );
        });
        fetchMock.mockRestore();
    });

    test("Handles fetch success and failure for all API calls", async ()=> {
        const fakeToken = "test_token";
        (useSpotify as jest.Mock).mockImplementation(() => ({
            playlistsData: [],
            setPlaylistsData: jest.fn(),
            userInfo: null,
            setUserInfo: jest.fn(),
            token: fakeToken,
            setToken: jest.fn(),
        }));

        const fetchMock = jest.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Test error"));
        const consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => {});

        render(<Dashboard />);
        await waitFor(() => {
            expect(consoleErrorMock).toHaveBeenCalled();
        });
        fetchMock.mockRestore();
        consoleErrorMock.mockRestore();
    });
});