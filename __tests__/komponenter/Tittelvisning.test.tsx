/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/react";
import { Tittelvisning } from "@/src/komponenter/Tittelvisning";
import { profilMedPoeng } from "../fixtures/profiler";
import {
  ADJEKTIV,
  ANTALL_NIVÅER,
  poengGrenseForNivå,
  TITLER,
} from "@/src/domene/titler";

describe("Tittelvisning", () => {
  it("viser nivå 0 (første adjektiv + første tittel) for 0 poeng", () => {
    const profil = profilMedPoeng(0);
    const { container } = render(<Tittelvisning profil={profil} />);
    expect(container.textContent).toContain(ADJEKTIV[0]);
    expect(container.textContent).toContain(TITLER[0]);
    expect(container.textContent).toContain("0");
  });

  it("viser ny tittel etter at poenggrensen er passert", () => {
    const grense4 = poengGrenseForNivå(4);
    const profil = profilMedPoeng(grense4);
    const { container } = render(<Tittelvisning profil={profil} />);
    // Nivå 4 = første nivå med tittel #2 (Talltroll) + første adjektiv
    expect(container.textContent).toContain(TITLER[1]);
    expect(container.textContent).toContain(ADJEKTIV[0]);
  });

  it('viser "(N til neste)"-tekst når man ikke er på maks', () => {
    const profil = profilMedPoeng(2);
    const { container } = render(<Tittelvisning profil={profil} />);
    expect(container.textContent).toContain("til neste");
  });

  it("skjuler 'til neste' når man er på maksnivå", () => {
    const grenseSiste = poengGrenseForNivå(ANTALL_NIVÅER - 1);
    const profil = profilMedPoeng(grenseSiste);
    const { container } = render(<Tittelvisning profil={profil} />);
    expect(container.textContent).not.toContain("til neste");
  });

  it("har en progressbar med riktig aria-attributter", () => {
    const profil = profilMedPoeng(0);
    const { getByRole } = render(<Tittelvisning profil={profil} />);
    const bar = getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });
});
