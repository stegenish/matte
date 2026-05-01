/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/react";
import { Tårn } from "@/src/komponenter/Tårn";
import { ANTALL_ETASJER } from "@/src/domene/titler";

describe("Tårn", () => {
  it("rendrer SVG med riktig antall etasjer i ARIA-label", () => {
    const { getByLabelText } = render(<Tårn etasje={0} navn="Lily" />);
    expect(getByLabelText(/Lily sitt mattetårn/)).toBeInTheDocument();
    expect(getByLabelText(/1 av 15/)).toBeInTheDocument();
  });

  it("rendrer riktig antall i caption på første etasje", () => {
    const { container } = render(<Tårn etasje={0} navn="Lily" />);
    expect(container.textContent).toContain(`1 / ${ANTALL_ETASJER} etasjer`);
  });

  it("rendrer caption for siste etasje", () => {
    const { container } = render(
      <Tårn etasje={ANTALL_ETASJER - 1} navn="Kian" />,
    );
    expect(container.textContent).toContain(
      `${ANTALL_ETASJER} / ${ANTALL_ETASJER} etasjer`,
    );
  });

  it("snapshot første etasje", () => {
    const { container } = render(<Tårn etasje={0} navn="Lily" />);
    expect(container).toMatchSnapshot();
  });

  it("snapshot midt-tårn (etasje 7)", () => {
    const { container } = render(<Tårn etasje={7} navn="Lily" />);
    expect(container).toMatchSnapshot();
  });

  it("snapshot fullt tårn med flagg", () => {
    const { container } = render(
      <Tårn etasje={ANTALL_ETASJER - 1} navn="Lily" />,
    );
    expect(container).toMatchSnapshot();
  });
});
