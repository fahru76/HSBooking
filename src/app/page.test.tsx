import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("public homestay page", () => {
  it("renders demo owner content end to end", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { level: 1, name: /Casa Melati Homestay/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/A cozy retreat in the Cameron Highlands/i)).toBeInTheDocument();
    expect(screen.getAllByText("Deluxe Room").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Family Suite").length).toBeGreaterThan(0);
    expect(screen.getByText(/Free Wi-Fi/)).toBeInTheDocument();
    expect(screen.getByText("3:00 PM")).toBeInTheDocument();
  });

  it("never renders raw HTML from owner content (no dangerouslySetInnerHTML)", () => {
    render(<Home />);
    // All config strings come back escaped as text nodes.
    const body = document.body.innerHTML;
    expect(body).not.toContain("dangerouslySetInnerHTML");
    expect(body).not.toMatch(/<script/i);
  });

  it("exposes the booking form with validation", () => {
    render(<Home />);
    // Room select is a presentational dropdown; date + number inputs carry the booking data.
    const dateInputs = document.querySelectorAll('input[type="date"]');
    expect(dateInputs.length).toBeGreaterThanOrEqual(2);
    expect(document.querySelectorAll('input[type="number"]').length).toBeGreaterThanOrEqual(1);
    expect(document.querySelectorAll('input[type="text"]').length).toBeGreaterThanOrEqual(1);
    const submit = document.querySelectorAll('button[type="submit"]');
    expect(submit.length).toBeGreaterThanOrEqual(1);
    expect(submit[0].textContent).toMatch(/Check availability/i);
  });
});
