import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import Home from "../../app/page";
import "whatwg-fetch";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://spotify-playlist-manager-backend-atej.onrender.com";

test("The title 'Spotify Playlist Manager' is rendered", () => {
  const { getByText } = render(<Home />);
  expect(getByText("Spotify Playlist Manager")).toBeInTheDocument();
});

test("The 'Login with Spotify' button is rendered.", () => {
  const { getByText } = render(<Home />);
  expect(getByText("Login with Spotify")).toBeInTheDocument();
});

test("Clicking the button triggers a fetch call to the correct backend URL with the correct method and headers", async () => {
  const fetchMock = jest.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({}),
  } as Response);

  render(<Home />);
  const button = screen.getByText("Login with Spotify");
  fireEvent.click(button);

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      `${backendUrl}/getAuthorizationUrl`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      })
    );
  });

  fetchMock.mockRestore();
});

test("On successful fetch, the app sets window.location.href to the returned authorization URL", async () => {
  const fakeUrl = "http://localhost/";
  jest.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => fakeUrl,
  } as Response);

  const originalHref = window.location.href;
  delete (window as any).location;
  (window as any).location = { href: "" };

  render(<Home />);
  const button = screen.getByText("Login with Spotify");
  fireEvent.click(button);

  await waitFor(() => {
    expect(window.location.href).toBe(fakeUrl);
  });

  (window as any).location.href = originalHref;
});

test("If the fetch response is not OK, an error is logged", async () => {
  const fetchMock = jest.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: false,
    status: 500,
    statusText: "Internal Server Error",
    json: async () => ({}),
  } as Response);

  const consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => {});

  render(<Home />);
  const button = screen.getByText("Login with Spotify");
  fireEvent.click(button);

  await waitFor(() => {
    expect(consoleErrorMock).toHaveBeenCalled();
  });

  fetchMock.mockRestore();
  consoleErrorMock.mockRestore();
});