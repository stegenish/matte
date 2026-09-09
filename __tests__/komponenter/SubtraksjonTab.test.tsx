/**
 * @jest-environment jsdom
 */
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Subtraksjonsaktivitet,
  SubtraksjonTab,
} from "@/app/oppgaver/SubtraksjonTab";
import { ProfilProvider } from "@/src/komponenter/ProfilProvider";
import { lagFakeLager } from "../fixtures/fakeLager";
import { lagNyProfil } from "@/src/domene/profil";

const OPPGAVE = { a: 3, b: 1, operasjon: "-" as const, svar: 2 };

describe("Subtraksjonsaktivitet", () => {
  it("lar barnet legge til, krysse ut og svare før addisjonen fullføres", async () => {
    const user = userEvent.setup();
    const onSvar = jest.fn();
    render(
      <Subtraksjonsaktivitet
        oppgave={OPPGAVE}
        kapasitet={5}
        onSvar={onSvar}
      />,
    );

    expect(screen.getByText("1 + ? = 3")).toBeInTheDocument();
    expect(screen.getByRole("spinbutton")).toBeDisabled();

    const ruter = screen.getAllByRole("button", { name: /Tom rute/ });
    await user.click(ruter[0]);
    await user.click(ruter[1]);
    await user.click(ruter[2]);
    expect(screen.getByText(/Hvor mange tar jeg bort/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Ball 1, klikk for å ta bort/ }));
    expect(screen.getAllByText("Hvor mange har jeg igjen?")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Ball 2, igjen" })).toBeDisabled();

    await user.type(screen.getByRole("spinbutton"), "1");
    await user.click(screen.getByRole("button", { name: "Sjekk svaret" }));
    fireEvent.click(screen.getByRole("button", { name: "Sjekk svaret" }));
    expect(onSvar).toHaveBeenCalledTimes(1);
    expect(onSvar).toHaveBeenLastCalledWith(false);

    await user.clear(screen.getByRole("spinbutton"));
    await user.type(screen.getByRole("spinbutton"), "2");
    await user.click(screen.getByRole("button", { name: "Sjekk svaret" }));

    expect(onSvar).toHaveBeenNthCalledWith(2, true);
    expect(screen.getByText("1 + 2 = 3")).toBeInTheDocument();
    for (const rute of screen.getAllByRole("button", { name: /Ball|Tom rute/ })) {
      expect(rute).toBeDisabled();
    }
  });
});

describe("SubtraksjonTab øvemodus", () => {
  it("gir poeng nøyaktig én gang for et riktig svar", async () => {
    const user = userEvent.setup();
    const profil = lagNyProfil("Lily", "🦊");
    const leggTilPoeng = jest.fn();
    render(
      <ProfilProvider lager={lagFakeLager([profil], profil.id)}>
        <SubtraksjonTab
          leggTilPoeng={leggTilPoeng}
          lagOppgave={() => OPPGAVE}
        />
      </ProfilProvider>,
    );
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByRole("button", { name: "10" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "20" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "Jeg vil prøve selv" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Vis eksempel" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    const ruter = screen.getAllByRole("button", { name: /Tom rute/ });
    await user.click(ruter[0]);
    await user.click(ruter[1]);
    await user.click(ruter[2]);
    await user.click(screen.getByRole("button", { name: /Ball 1, klikk for å ta bort/ }));
    await user.type(screen.getByRole("spinbutton"), "2");
    await user.click(screen.getByRole("button", { name: "Sjekk svaret" }));
    fireEvent.click(screen.getByRole("button", { name: "Sjekk svaret" }));

    expect(leggTilPoeng).toHaveBeenCalledTimes(1);
  });
});

describe("SubtraksjonTab eksempelmodus", () => {
  afterEach(() => jest.useRealTimers());

  it("løser et eksempel uten å gi poeng og tilbyr et nytt eksempel", async () => {
    const profil = lagNyProfil("Lily", "🦊");
    const leggTilPoeng = jest.fn();
    render(
      <ProfilProvider lager={lagFakeLager([profil], profil.id)}>
        <SubtraksjonTab
          leggTilPoeng={leggTilPoeng}
          lagOppgave={() => OPPGAVE}
        />
      </ProfilProvider>,
    );

    await act(async () => {
      await Promise.resolve();
    });
    jest.useFakeTimers();

    fireEvent.click(screen.getByRole("button", { name: "Vis eksempel" }));
    act(() => jest.runAllTimers());

    expect(screen.getByText("3 − 1 = 2")).toBeInTheDocument();
    expect(screen.getByText("1 + 2 = 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nytt eksempel" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Nytt eksempel" }));
    act(() => jest.runAllTimers());

    expect(screen.getByText("3 − 1 = 2")).toBeInTheDocument();
    expect(leggTilPoeng).not.toHaveBeenCalled();
  });
});
