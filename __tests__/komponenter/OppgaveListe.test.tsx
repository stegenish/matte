/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OppgaveListe from "@/app/oppgaver/OppgaveListe";
import { ProfilProvider } from "@/src/komponenter/ProfilProvider";
import { lagFakeLager } from "../fixtures/fakeLager";
import { lagNyProfil } from "@/src/domene/profil";

describe("OppgaveListe", () => {
  it("registrerer et Enter-svar nøyaktig én gang når fokus flyttes", async () => {
    const user = userEvent.setup();
    const leggTilPoeng = jest.fn();
    const profil = lagNyProfil("Lily", "🦊");
    const lager = lagFakeLager([profil], profil.id);

    render(
      <ProfilProvider lager={lager}>
        <OppgaveListe
          oppgaver={[
            { a: 1, b: 1, operasjon: "+", svar: 2 },
            { a: 2, b: 1, operasjon: "+", svar: 3 },
          ]}
          leggTilPoeng={leggTilPoeng}
          onNyRunde={jest.fn()}
        />
      </ProfilProvider>,
    );

    await user.type(screen.getAllByRole("spinbutton")[0], "2{Enter}");

    expect(leggTilPoeng).toHaveBeenCalledTimes(1);
    expect(lager.hentSync(profil.id)?.statistikk.totaltRiktige).toBe(1);
  });
});
