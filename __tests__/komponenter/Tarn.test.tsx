/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/react";
import { Tårn } from "@/src/komponenter/Tårn";
import { ANTALL_ETASJER } from "@/src/domene/titler";

describe("Tårn", () => {
  it("har aria-label som beskriver antall bygde etasjer", () => {
    const { getByLabelText } = render(<Tårn etasje={0} navn="Lily" />);
    expect(getByLabelText(/Lily sitt mattetårn/)).toBeInTheDocument();
    expect(getByLabelText(/1 av 15/)).toBeInTheDocument();
  });

  it("caption viser N / max etasjer", () => {
    const { container } = render(<Tårn etasje={0} navn="Lily" />);
    expect(container.textContent).toContain(`1 / ${ANTALL_ETASJER} etasjer`);
  });

  it("caption på siste etasje er fullt tårn", () => {
    const { container } = render(
      <Tårn etasje={ANTALL_ETASJER - 1} navn="Kian" />,
    );
    expect(container.textContent).toContain(
      `${ANTALL_ETASJER} / ${ANTALL_ETASJER} etasjer`,
    );
  });

  it("rendrer kun synlige etasjer (ikke utgrå plassholdere)", () => {
    // Etasje 0 = 1 etasje synlig + 1 base (gress) = 2 hovedrektangler + vindu (1)
    // Vi sjekker antall etasje-grupper, som tilsvarer (etasje + 1)
    const { container } = render(<Tårn etasje={2} navn="Lily" />);
    // 3 etasjer * (1 rect + 1 vindu rect) = 6 rect for etasjer + 2 grass rects
    const rects = container.querySelectorAll("rect");
    // 2 grass + 3 etasjer * 2 (kropp + vindu) = 8
    expect(rects).toHaveLength(2 + 3 * 2);
  });

  it("flagg vises på siste etasje", () => {
    const { container } = render(
      <Tårn etasje={ANTALL_ETASJER - 1} navn="Lily" />,
    );
    // Flagg = polygon-element
    expect(container.querySelectorAll("polygon")).toHaveLength(1);
  });

  it("ingen flagg før siste etasje er nådd", () => {
    const { container } = render(
      <Tårn etasje={ANTALL_ETASJER - 2} navn="Lily" />,
    );
    expect(container.querySelectorAll("polygon")).toHaveLength(0);
  });
});
