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
