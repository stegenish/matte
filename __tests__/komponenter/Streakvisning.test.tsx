/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/react";
import { Streakvisning } from "@/src/komponenter/Streakvisning";
import { nyStreak } from "@/src/domene/streak";

describe("Streakvisning", () => {
  it("rendrer ingenting når streak er 0", () => {
    const { container } = render(<Streakvisning streak={nyStreak()} />);
    expect(container.firstChild).toBeNull();
  });

  it("viser ✨ + teller før grensen er nådd", () => {
    const { container } = render(
      <Streakvisning streak={{ riktigPåRad: 2, skjoldIntakt: true }} />,
    );
    expect(container.textContent).toContain("✨");
    expect(container.textContent).toContain("×2");
    expect(container.textContent).not.toContain("🔥");
    expect(container.textContent).not.toContain("🛡");
  });

  it("viser 🔥 + skjold når streak er over grensen og skjoldet er intakt", () => {
    const { container } = render(
      <Streakvisning streak={{ riktigPåRad: 5, skjoldIntakt: true }} />,
    );
    expect(container.textContent).toContain("🔥");
    expect(container.textContent).toContain("×5");
    expect(container.textContent).toContain("🛡");
  });

  it("viser 🔥 men ikke skjold når skjoldet er brukt", () => {
    const { container } = render(
      <Streakvisning streak={{ riktigPåRad: 5, skjoldIntakt: false }} />,
    );
    expect(container.textContent).toContain("🔥");
    expect(container.textContent).not.toContain("🛡");
  });
});
