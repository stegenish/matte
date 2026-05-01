/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/react";
import { TenFrame } from "@/src/komponenter/TenFrame";

describe("TenFrame", () => {
  it("rendrer 10 sirkler med default props", () => {
    const { container } = render(<TenFrame />);
    expect(container.querySelectorAll("circle")).toHaveLength(10);
  });

  it("rendrer angitt antall sirkler", () => {
    const { container } = render(<TenFrame total={7} />);
    expect(container.querySelectorAll("circle")).toHaveLength(7);
  });

  it("rendrer kryss-strek for hver krysset sirkel", () => {
    const { container } = render(<TenFrame total={10} krysset={3} />);
    expect(container.querySelectorAll("line")).toHaveLength(3);
  });

  it("ingen kryss når krysset=0", () => {
    const { container } = render(<TenFrame total={10} krysset={0} />);
    expect(container.querySelectorAll("line")).toHaveLength(0);
  });

  it("kapper krysset til total", () => {
    const { container } = render(<TenFrame total={5} krysset={20} />);
    expect(container.querySelectorAll("line")).toHaveLength(5);
  });

  it("kapper total til 10", () => {
    const { container } = render(<TenFrame total={20} />);
    expect(container.querySelectorAll("circle")).toHaveLength(10);
  });

  it("har aria-label som beskriver gjenværende verdi", () => {
    const { getByRole } = render(<TenFrame total={10} krysset={3} />);
    expect(getByRole("img")).toHaveAttribute(
      "aria-label",
      "Ten-frame: 7 av 10",
    );
  });

});
