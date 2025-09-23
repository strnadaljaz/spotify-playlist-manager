import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import React from "react";
import Home from '../../app/page';

test("If title renders", () => {
  const { getByText } = render(<Home />);
  expect(getByText('Spotify Playlist Manager')).toBeInTheDocument();
});

test("If button renders", () => {
  const { getByText } = render(<Home />);
  expect(getByText('Login with Spotify')).toBeInTheDocument();
});